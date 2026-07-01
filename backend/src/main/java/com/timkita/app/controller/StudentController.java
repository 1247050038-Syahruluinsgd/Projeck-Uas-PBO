package com.timkita.app.controller;

import com.timkita.app.model.StudentRecord;
import com.timkita.app.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /** GET /api/students?status=ALL&search= */
    @GetMapping
    public ResponseEntity<List<StudentRecord>> getAll(
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "") String search) {
        return ResponseEntity.ok(studentService.getAllStudents(status, search));
    }

    /** DELETE /api/students/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String id) {
        Map<String, Object> result = studentService.deleteRecord(id);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(404).body(result);
    }

    /** POST /api/students/scan-mock — Issue #7 */
    @PostMapping("/scan-mock")
    public ResponseEntity<StudentRecord> saveMockScan(@RequestBody Map<String, Object> payload) {
        StudentRecord saved = studentService.saveMockScan(payload);
        return ResponseEntity.ok(saved);
    }
}
