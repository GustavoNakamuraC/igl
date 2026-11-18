package com.igl.map;

import java.util.Arrays;

/** Os 8 mapas suportados. Os dados de cada mapa (nome, imagem) ficam estáticos no front-end. */
public enum MapSlug {
    ANCIENT("ancient"),
    ANUBIS("anubis"),
    CACHE("cache"),
    COBBLESTONE("cobblestone"),
    DUST2("dust2"),
    INFERNO("inferno"),
    MIRAGE("mirage"),
    NUKE("nuke");

    private final String slug;

    MapSlug(String slug) {
        this.slug = slug;
    }

    public String slug() {
        return slug;
    }

    public static boolean isValid(String slug) {
        return Arrays.stream(values()).anyMatch(m -> m.slug.equals(slug));
    }

    public static String require(String slug) {
        if (!isValid(slug)) {
            throw new UnknownMapException(slug);
        }
        return slug;
    }
}
