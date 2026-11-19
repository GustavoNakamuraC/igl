package com.igl.grenade;

import jakarta.persistence.Embeddable;

/** Ponto do lineup (arremesso ou queda): coordenada normalizada + rótulo livre. */
@Embeddable
public class ThrowPoint {
    private double x;
    private double y;
    private String label;

    protected ThrowPoint() {
    }

    public ThrowPoint(double x, double y, String label) {
        this.x = x;
        this.y = y;
        this.label = label;
    }

    public double getX() { return x; }
    public double getY() { return y; }
    public String getLabel() { return label; }
}
