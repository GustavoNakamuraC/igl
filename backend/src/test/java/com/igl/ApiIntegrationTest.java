package com.igl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class ApiIntegrationTest {

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

    private static final String REGION = """
            {"name":"Varanda","points":[{"x":0.1,"y":0.1},{"x":0.3,"y":0.1},{"x":0.2,"y":0.3}]}""";

    private static final String GRENADE = """
            {"type":"smoke","start":{"x":0.2,"y":0.15,"label":"Varanda"},
             "end":{"x":0.5,"y":0.5,"label":"Meio"},"howTo":"Mira na antena e pula"}""";

    @Test
    void liquibaseCreatesSchemaWithChecksAndRls() {
        Integer changesets = jdbc.queryForObject("select count(*) from databasechangelog", Integer.class);
        assertThat(changesets).isGreaterThanOrEqualTo(11);
        Boolean rls = jdbc.queryForObject(
                "select relrowsecurity from pg_class where relname = 'grenades'", Boolean.class);
        assertThat(rls).isTrue();
        Integer withoutRls = jdbc.queryForObject("""
                select count(*) from pg_class
                where relname in ('images', 'players', 'player_grenades', 'grenade_images') and not relrowsecurity""",
                Integer.class);
        assertThat(withoutRls).isZero();
    }

    @Test
    void regionCrud() throws Exception {
        String body = mvc.perform(post("/api/maps/mirage/regions").contentType(MediaType.APPLICATION_JSON).content(REGION))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Varanda"))
                .andExpect(jsonPath("$.points", hasSize(3)))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(body, "$.id");

        mvc.perform(get("/api/maps/mirage/regions")).andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/maps/inferno/regions")).andExpect(jsonPath("$", hasSize(0)));

        mvc.perform(put("/api/regions/" + id).contentType(MediaType.APPLICATION_JSON)
                        .content(REGION.replace("Varanda", "Janela")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Janela"));

        mvc.perform(delete("/api/regions/" + id)).andExpect(status().isNoContent());
        mvc.perform(delete("/api/regions/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void grenadeCrudAndValidation() throws Exception {
        String body = mvc.perform(post("/api/maps/dust2/grenades").contentType(MediaType.APPLICATION_JSON).content(GRENADE))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("smoke"))
                .andExpect(jsonPath("$.start.label").value("Varanda"))
                .andExpect(jsonPath("$.end.x").value(0.5))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(body, "$.id");

        mvc.perform(put("/api/grenades/" + id).contentType(MediaType.APPLICATION_JSON)
                        .content(GRENADE.replace("smoke", "flash")))
                .andExpect(jsonPath("$.type").value("flash"));

        mvc.perform(post("/api/maps/dust2/grenades").contentType(MediaType.APPLICATION_JSON)
                        .content(GRENADE.replace("smoke", "decoy")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/maps/dust2/grenades").contentType(MediaType.APPLICATION_JSON)
                        .content(GRENADE.replace("\"x\":0.5", "\"x\":1.5")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/maps/dust2/grenades").contentType(MediaType.APPLICATION_JSON)
                        .content(GRENADE.replace("Mira na antena e pula", " ")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/maps/vertigo/grenades").contentType(MediaType.APPLICATION_JSON).content(GRENADE))
                .andExpect(status().isNotFound());

        mvc.perform(delete("/api/grenades/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/maps/dust2/grenades")).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void backupRoundTrip() throws Exception {
        mvc.perform(post("/api/maps/mirage/regions").contentType(MediaType.APPLICATION_JSON).content(REGION));
        mvc.perform(post("/api/maps/mirage/grenades").contentType(MediaType.APPLICATION_JSON).content(GRENADE));

        String backup = mvc.perform(get("/api/backup"))
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.regions", hasSize(1)))
                .andExpect(jsonPath("$.grenades", hasSize(1)))
                .andReturn().getResponse().getContentAsString();
        String grenadeId = JsonPath.read(backup, "$.grenades[0].id");

        clean();
        mvc.perform(post("/api/backup").contentType(MediaType.APPLICATION_JSON).content(backup))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/maps/mirage/grenades"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(grenadeId))
                .andExpect(jsonPath("$[0].howTo").value("Mira na antena e pula"));
        mvc.perform(get("/api/maps/mirage/regions"))
                .andExpect(jsonPath("$[0].points", hasSize(3)));
    }

    @Test
    void healthIsUp() throws Exception {
        mvc.perform(get("/api/actuator/health")).andExpect(jsonPath("$.status").value("UP"));
    }
}
