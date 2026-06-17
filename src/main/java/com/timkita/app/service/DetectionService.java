package com.timkita.app.service;

import com.app.interfaces.AttributeDetector;
import com.app.model.Attribute;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DetectionService {

    private final AttributeDetector attributeDetector;

    public DetectionService(AttributeDetector attributeDetector) {
        this.attributeDetector = attributeDetector;
    }

    public List<Attribute> jalankanScanAtribut() {
        return attributeDetector.detect();
    }
}
