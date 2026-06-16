package com.timkita.app.interfaces;

import businesslogic.exception.DetectionException;
import businesslogic.model.Attribute;

import java.util.List;

public interface AttributeDetector {
    List<Attribute> detect(String input) throws DetectionException;
}