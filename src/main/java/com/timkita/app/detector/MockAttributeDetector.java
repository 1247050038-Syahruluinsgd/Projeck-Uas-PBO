package com.timkita.app.detector;

import com.app.interfaces.AttributeDetector;
import com.app.model.Attribute;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class MockAttributeDetector implements AttributeDetector {
    
    @Override
    public List<Attribute> detect() {
        List<Attribute> dummyResult = new ArrayList<>();
        
        dummyResult.add(new Attribute("Kemeja Putih", "OK"));
        dummyResult.add(new Attribute("Nametag", "Tidak Ada")); 
        dummyResult.add(new Attribute("Sabuk", "OK"));
        dummyResult.add(new Attribute("Celana/Rok Hitam", "OK"));
        dummyResult.add(new Attribute("Kerudung Pink", "OK"));
        dummyResult.add(new Attribute("Sepatu Pantofel", "OK"));
        
        return dummyResult;
    }
}