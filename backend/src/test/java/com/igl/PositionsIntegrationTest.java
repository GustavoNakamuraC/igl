package com.igl;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class PositionsIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    JdbcTemplate jdbc;

    @BeforeEach
    void clean() {
        jdbc.update("delete from grenades");
        jdbc.update("delete from players");
        jdbc.update("delete from regions");
        jdbc.update("delete from images");
    }

    private String create(String url, String json) throws Exception {
        String body = mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    private String region(String map, String name) throws Exception {
        return create("/api/maps/" + map + "/regions", """
                {"name":"%s","points":[{"x":0.1,"y":0.1},{"x":0.3,"y":0.1},{"x":0.2,"y":0.3}]}""".formatted(name));
    }

    private String player(String name) throws Exception {
        return create("/api/players", """
                {"name":"%s","role":"Entry","secondaryRole":"Suporte","color":"blue"}""".formatted(name));
    }

    private String position(String player, String region, String side) throws Exception {
        return create("/api/positions", """
                {"playerId":"%s","regionId":"%s","side":"%s"}""".formatted(player, region, side));
    }

    @Test
    void secondaryRole() throws Exception {
        String id = player("Ana");
        mvc.perform(get("/api/players")).andExpect(jsonPath("$[0].secondaryRole").value("Suporte"));
        mvc.perform(put("/api/players/" + id).contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Ana","role":"AWP","secondaryRole":"  ","color":"blue"}"""))
                .andExpect(jsonPath("$.role").value("AWP"))
                .andExpect(jsonPath("$.secondaryRole").doesNotExist());
    }

    @Test
    void positionsCrud() throws Exception {
        String ana = player("Ana");
        String beto = player("Beto");
        String bombA = region("dust2", "Bomb A");
        String meio = region("dust2", "Meio");
        String outroMapa = region("mirage", "Janela");

        position(ana, bombA, "ct");
        position(ana, meio, "ct");      // várias posições no mesmo lado
        position(ana, meio, "tr");
        String betoA = position(beto, bombA, "ct");
        position(ana, outroMapa, "ct");

        mvc.perform(get("/api/maps/dust2/positions")).andExpect(jsonPath("$", hasSize(4)));
        mvc.perform(get("/api/maps/mirage/positions")).andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/players/" + ana + "/positions"))
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[?(@.mapSlug == 'dust2' && @.side == 'ct')].regionName",
                        containsInAnyOrder("Bomb A", "Meio")))
                .andExpect(jsonPath("$[?(@.side == 'tr')].regionName", contains("Meio")));

        // Duplicada, lado inválido, referências inexistentes.
        mvc.perform(post("/api/positions").contentType(MediaType.APPLICATION_JSON).content("""
                        {"playerId":"%s","regionId":"%s","side":"ct"}""".formatted(ana, bombA)))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/positions").contentType(MediaType.APPLICATION_JSON).content("""
                        {"playerId":"%s","regionId":"%s","side":"both"}""".formatted(ana, bombA)))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/positions").contentType(MediaType.APPLICATION_JSON).content("""
                        {"playerId":"00000000-0000-0000-0000-000000000000","regionId":"%s","side":"ct"}"""
                        .formatted(bombA)))
                .andExpect(status().isNotFound());

        mvc.perform(delete("/api/positions/" + betoA)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/positions/" + betoA)).andExpect(status().isNotFound());

        // Excluir região apaga as posições dela; excluir jogador apaga as dele.
        mvc.perform(delete("/api/regions/" + meio)).andExpect(status().isNoContent());
        mvc.perform(get("/api/maps/dust2/positions")).andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(delete("/api/players/" + ana)).andExpect(status().isNoContent());
        mvc.perform(get("/api/maps/dust2/positions")).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void backupKeepsPositions() throws Exception {
        String ana = player("Ana");
        String bombA = region("nuke", "Bomb A");
        position(ana, bombA, "tr");

        String backup = mvc.perform(get("/api/backup"))
                .andExpect(jsonPath("$.positions", hasSize(1)))
                .andExpect(jsonPath("$.players[0].secondaryRole").value("Suporte"))
                .andReturn().getResponse().getContentAsString();
        clean();
        mvc.perform(post("/api/backup").contentType(MediaType.APPLICATION_JSON).content(backup))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/maps/nuke/positions"))
                .andExpect(jsonPath("$[0].playerId").value(ana))
                .andExpect(jsonPath("$[0].side").value("tr"));
        mvc.perform(get("/api/players")).andExpect(jsonPath("$[0].secondaryRole").value("Suporte"));
    }
}
