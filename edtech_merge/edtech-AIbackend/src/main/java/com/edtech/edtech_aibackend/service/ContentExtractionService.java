package com.edtech.edtech_aibackend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ContentExtractionService {
    
    private static final Pattern TIMESTAMP_PATTERN = Pattern.compile("^\\d{2}:\\d{2}:\\d{2}\\.\\d{3}\\s+-->\\s+\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$");
    private static final Pattern WEBVTT_HEADER = Pattern.compile("^WEBVTT");
    
    // PDF extraction methods
    public String extractTextFromPDF(String pdfPath) throws IOException {
        File file = new File(pdfPath);
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
    
    public String extractTextFromPDF(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
    
    // VTT extraction methods
    public String extractTextFromVTT(InputStream inputStream) throws IOException {
        StringBuilder content = new StringBuilder();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                
                // Skip WEBVTT header
                if (WEBVTT_HEADER.matcher(line).find()) {
                    continue;
                }
                
                // Skip empty lines
                if (line.isEmpty()) {
                    continue;
                }
                
                // Skip timestamp lines
                if (TIMESTAMP_PATTERN.matcher(line).matches()) {
                    continue;
                }
                
                // Skip cue identifiers (usually numbers before timestamps)
                if (line.matches("^\\d+$")) {
                    continue;
                }
                
                // Add content text
                if (content.length() > 0) {
                    content.append(" ");
                }
                content.append(line);
            }
        }
        
        return content.toString();
    }
    
    // Common text processing methods
    public List<String> chunkText(String text, int maxChunkSize) {
        List<String> chunks = new ArrayList<>();
        String[] sentences = text.split("\\. ");
        
        StringBuilder currentChunk = new StringBuilder();
        for (String sentence : sentences) {
            if (currentChunk.length() + sentence.length() > maxChunkSize && currentChunk.length() > 0) {
                chunks.add(currentChunk.toString());
                currentChunk = new StringBuilder();
            }
            currentChunk.append(sentence).append(". ");
        }
        
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString());
        }
        
        return chunks;
    }
}