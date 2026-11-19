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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class PlayersAndImagesIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    JdbcTemplate jdbc;

    private static final byte[] FAKE_WEBP = "RIFF....WEBPVP8 fake".getBytes();

    @BeforeEach
    void clean() {
        jdbc.update("delete from grenades");
        jdbc.update("delete from players");
        jdbc.update("delete from regions");
        jdbc.update("delete from images");
    }

    private String uploadImage() throws Exception {
        String body = mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "print.webp", "image/webp", FAKE_WEBP)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    private String createPlayer(String name, String color, String photoId) throws Exception {
        String photo = photoId == null ? "null" : "\"" + photoId + "\"";
        String body = mvc.perform(post("/api/players").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"%s","role":"Entry","notes":"Joga de AK","color":"%s","photoId":%s}"""
                        .formatted(name, color, photo)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    private String grenadeJson(List<String> playerIds, List<String> imageIds) {
        String players = playerIds.stream().map(id -> "\"" + id + "\"").reduce((a, b) -> a + "," + b).orElse("");
        String images = imageIds.stream().map(id -> "\"" + id + "\"").reduce((a, b) -> a + "," + b).orElse("");
        return """
                {"type":"smoke","side":"ct","start":{"x":0.2,"y":0.2,"label":"T spawn"},"end":{"x":0.5,"y":0.5,"label":"Meio"},
                 "howTo":"Mira na antena","notes":"Funciona só no tick 64","playerIds":[%s],"imageIds":[%s]}"""
                .formatted(players, images);
    }

    @Test
    void imageUploadAndDownload() throws Exception {
        String id = uploadImage();
        mvc.perform(get("/api/images/" + id))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/webp"))
                .andExpect(content().bytes(FAKE_WEBP))
                .andExpect(header().string("Cache-Control", containsString("immutable")));

        mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "x.gif", "image/gif", FAKE_WEBP)))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "big.png", "image/png", new byte[2 * 1024 * 1024 + 1])))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void playerCrudAndPhotoCleanup() throws Exception {
        mvc.perform(get("/api/players")).andExpect(jsonPath("$", hasSize(0)));

        String photo1 = uploadImage();
        String id = createPlayer("Nakamura", "orange", photo1);
        mvc.perform(get("/api/players"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].color").value("orange"))
                .andExpect(jsonPath("$[0].photoId").value(photo1));

        String photo2 = uploadImage();
        mvc.perform(put("/api/players/" + id).contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Naka","role":"","notes":null,"color":"purple","photoId":"%s"}""".formatted(photo2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Naka"))
                .andExpect(jsonPath("$.role").doesNotExist())
                .andExpect(jsonPath("$.photoId").value(photo2));
        // A foto antiga ficou órfã e foi apagada.
        mvc.perform(get("/api/images/" + photo1)).andExpect(status().isNotFound());

        mvc.perform(post("/api/players").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"color\":\"red\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/players").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\" \",\"color\":\"blue\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(delete("/api/players/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/images/" + photo2)).andExpect(status().isNotFound());
    }

    @Test
    void grenadeWithPlayersImagesAndNotes() throws Exception {
        String p1 = createPlayer("Ana", "blue", null);
        String p2 = createPlayer("Beto", "green", null);
        String img1 = uploadImage();
        String img2 = uploadImage();

        String body = mvc.perform(post("/api/maps/mirage/grenades").contentType(MediaType.APPLICATION_JSON)
                        .content(grenadeJson(List.of(p1, p2), List.of(img1, img2))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.notes").value("Funciona só no tick 64"))
                .andExpect(jsonPath("$.playerIds", contains(p1, p2)))
                .andExpect(jsonPath("$.imageIds", contains(img1, img2)))
                .andReturn().getResponse().getContentAsString();
        String grenadeId = JsonPath.read(body, "$.id");

        mvc.perform(get("/api/players/" + p1 + "/grenade-counts")).andExpect(jsonPath("$.mirage").value(1));

        // Reordena as imagens e remove uma: a removida é apagada.
        mvc.perform(put("/api/grenades/" + grenadeId).contentType(MediaType.APPLICATION_JSON)
                        .content(grenadeJson(List.of(p2), List.of(img2))))
                .andExpect(jsonPath("$.playerIds", contains(p2)))
                .andExpect(jsonPath("$.imageIds", contains(img2)));
        mvc.perform(get("/api/images/" + img1)).andExpect(status().isNotFound());

        // Referências inexistentes.
        mvc.perform(post("/api/maps/mirage/grenades").contentType(MediaType.APPLICATION_JSON)
                        .content(grenadeJson(List.of("00000000-0000-0000-0000-000000000000"), List.of())))
                .andExpect(status().isNotFound());

        // Excluir jogador tira o vínculo, mas a granada continua.
        mvc.perform(delete("/api/players/" + p2)).andExpect(status().isNoContent());
        mvc.perform(get("/api/maps/mirage/grenades"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].playerIds", hasSize(0)));

        // Excluir a granada apaga os prints dela.
        mvc.perform(delete("/api/grenades/" + grenadeId)).andExpect(status().isNoContent());
        Integer images = jdbc.queryForObject("select count(*) from images", Integer.class);
        assertThat(images).isZero();
    }

    @Test
    void backupV2RoundTripAndV1Compatibility() throws Exception {
        String photo = uploadImage();
        String p1 = createPlayer("Ana", "yellow", photo);
        String img = uploadImage();
        mvc.perform(post("/api/maps/inferno/grenades").contentType(MediaType.APPLICATION_JSON)
                .content(grenadeJson(List.of(p1), List.of(img))));

        String backup = mvc.perform(get("/api/backup"))
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.players", hasSize(1)))
                .andExpect(jsonPath("$.images", hasSize(2)))
                .andReturn().getResponse().getContentAsString();

        clean();
        mvc.perform(post("/api/backup").contentType(MediaType.APPLICATION_JSON).content(backup))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/players")).andExpect(jsonPath("$[0].photoId").value(photo));
        mvc.perform(get("/api/maps/inferno/grenades"))
                .andExpect(jsonPath("$[0].playerIds", contains(p1)))
                .andExpect(jsonPath("$[0].imageIds", contains(img)))
                .andExpect(jsonPath("$[0].notes").value("Funciona só no tick 64"));
        mvc.perform(get("/api/images/" + img)).andExpect(content().bytes(FAKE_WEBP));

        // Backup v1 (sem jogadores/imagens) continua importando.
        mvc.perform(post("/api/backup").contentType(MediaType.APPLICATION_JSON).content("""
                        {"version":1,"regions":[],"grenades":[{"mapSlug":"nuke","type":"he",
                          "start":{"x":0.1,"y":0.1,"label":null},"end":{"x":0.2,"y":0.2,"label":null},"howTo":"x"}]}"""))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/players")).andExpect(jsonPath("$", hasSize(0)));
        // ...e granadas de backups antigos (sem lado) viram "both".
        mvc.perform(get("/api/maps/nuke/grenades"))
                .andExpect(jsonPath("$[0].playerIds", hasSize(0)))
                .andExpect(jsonPath("$[0].side").value("both"));

        // Backup com referência quebrada é recusado sem apagar nada.
        mvc.perform(post("/api/backup").contentType(MediaType.APPLICATION_JSON).content("""
                        {"version":2,"regions":[],"players":[],"images":[],"grenades":[{"mapSlug":"nuke","type":"he",
                          "start":{"x":0.1,"y":0.1},"end":{"x":0.2,"y":0.2},"howTo":"x",
                          "playerIds":["00000000-0000-0000-0000-000000000000"]}]}"""))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/maps/nuke/grenades")).andExpect(jsonPath("$", hasSize(1)));
    }
}
