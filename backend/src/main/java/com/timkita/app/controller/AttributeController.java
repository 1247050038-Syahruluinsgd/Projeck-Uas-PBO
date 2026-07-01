package com.timkita.app.controller;

import com.timkita.app.model.Attribute;
import com.timkita.app.service.DetectionService;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class AttributeController {

    private final DetectionService detectionService;

    public AttributeController(DetectionService detectionService) {
        this.detectionService = detectionService;
    }

    public List<Attribute> handleTombolScanKlik() {
        return detectionService.jalankanScanAtribut();
    }
}