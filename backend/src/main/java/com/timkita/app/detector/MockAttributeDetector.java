package com.timkita.app.detector;

import com.timkita.app.interfaces.AttributeDetector;
import com.timkita.app.model.Attribute;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class MockAttributeDetector implements AttributeDetector {
    
    @Override
    public List<Attribute> detect() {
        List<Attribute> dummyResult = new ArrayList<>();
        
        dummyResult.add(new Attribute("Kemeja Putih", "Kemeja Putih", true));
        dummyResult.add(new Attribute("Nametag", "Nametag", false)); 
        dummyResult.add(new Attribute("Sabuk", "Sabuk", true));
        dummyResult.add(new Attribute("Celana/Rok Hitam", "Celana/Rok Hitam", true));
        dummyResult.add(new Attribute("Kerudung Pink", "Kerudung Pink", true));
        dummyResult.add(new Attribute("Sepatu Pantofel", "Sepatu Pantofel", true));
        
        return dummyResult;
    }
}