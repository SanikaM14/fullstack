package com.memory.memory_portal.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.memory.memory_portal.model.MemoryAnalysis;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MemoryAnalyzerService {
    
    private static final Pattern YEAR_PATTERN = Pattern.compile(".*(19|20)\\d{2}.*");
    private static final Set<String> PINK_TONES = Set.of("FFB6C1", "FF69B4", "DB7093", "C71585", "FF1493");
    private static final Set<String> RED_TONES = Set.of("DC143C", "B22222", "8B0000", "800000");
    private static final Set<String> BLUE_TONES = Set.of("0000FF", "4169E1", "1E90FF", "00BFFF", "87CEEB");
    private static final Set<String> GREEN_TONES = Set.of("008000", "228B22", "32CD32", "00FF00", "7CFC00");
    
    public MemoryAnalysis analyzeImage(MultipartFile file) {
        try {
            System.out.println("=== Starting Image Analysis ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            MemoryAnalysis analysis = new MemoryAnalysis();
            
            String year = extractYearFromFilename(file.getOriginalFilename());
            System.out.println("Extracted year: " + year);
            analysis.setYear(year);
            
            List<String> colors = extractDominantColors(file);
            System.out.println("Extracted colors: " + colors.size());
            analysis.setDominantColors(colors);
            
            List<String> tags = generateTags(file, analysis.getDominantColors());
            System.out.println("Generated tags: " + tags);
            analysis.setTags(tags);
            
            String mood = generateMood(analysis.getDominantColors(), analysis.getTags());
            System.out.println("Generated mood: " + mood);
            analysis.setMood(mood);
            
            analysis.setFileName(file.getOriginalFilename());
            analysis.setId(UUID.randomUUID().toString());
            analysis.setUploadDate(new Date());
            
            System.out.println("Image analysis completed successfully");
            return analysis;
        } catch (Exception e) {
            System.err.println("Error in image analysis: " + e.getMessage());
            e.printStackTrace();
            
            MemoryAnalysis analysis = new MemoryAnalysis();
            analysis.setYear("Unknown");
            analysis.setDominantColors(Arrays.asList("#FFB6C1", "#DC143C", "#8B0000"));
            analysis.setTags(Arrays.asList("Memory", "Flashback"));
            analysis.setMood("✨ Nostalgic");
            analysis.setFileName(file.getOriginalFilename());
            analysis.setId(UUID.randomUUID().toString());
            analysis.setUploadDate(new Date());
            
            return analysis;
        }
    }
    
    private String extractYearFromFilename(String filename) {
        if (filename == null) return "Unknown";
        
        var matcher = YEAR_PATTERN.matcher(filename);
        if (matcher.find()) {
            String yearPart = filename.substring(matcher.start(1), matcher.start(1) + 4);
            try {
                int year = Integer.parseInt(yearPart);
                if (year >= 1900 && year <= 2030) {
                    return yearPart;
                }
            } catch (NumberFormatException e) {
            }
        }
        
        String[] parts = filename.split("[^0-9]");
        for (String part : parts) {
            if (part.length() == 4) {
                try {
                    int year = Integer.parseInt(part);
                    if (year >= 1900 && year <= 2030) {
                        return part;
                    }
                } catch (NumberFormatException e) {
                }
            }
        }
        
        return "Unknown";
    }
    
    private List<String> extractDominantColors(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            BufferedImage image = ImageIO.read(is);
            if (image == null) {
                System.out.println("Could not read image, using default colors");
                return getDefaultColorPalette();
            }
            
            int width = image.getWidth();
            int height = image.getHeight();
            System.out.println("Image dimensions: " + width + "x" + height);
            
            List<Color> pixels = new ArrayList<>();
            int sampleSize = Math.min(10000, width * height);  
            
            Random random = new Random();
            
            int gridStep = (int) Math.sqrt(width * height / (sampleSize * 0.7));
            for (int x = 0; x < width; x += gridStep) {
                for (int y = 0; y < height; y += gridStep) {
                    int rgb = image.getRGB(x, y);
                    pixels.add(new Color(rgb, true));
                }
            }
            
            while (pixels.size() < sampleSize) {
                int x = random.nextInt(width);
                int y = random.nextInt(height);
                int rgb = image.getRGB(x, y);
                pixels.add(new Color(rgb, true));
            }
            
            int k = 5; 
            List<Color> dominantColors = kMeansClustering(pixels, k);
            
            List<String> hexColors = dominantColors.stream()
                .map(color -> String.format("#%02X%02X%02X", 
                    color.getRed(), color.getGreen(), color.getBlue()))
                .collect(Collectors.toList());
            
            System.out.println("Extracted colors: " + hexColors);
            return hexColors;
                    
        } catch (Exception e) {
            System.err.println("Error extracting colors: " + e.getMessage());
            return getDefaultColorPalette();
        }
    }
    
    private List<Color> kMeansClustering(List<Color> pixels, int k) {
        List<Color> centroids = new ArrayList<>();
        Random random = new Random();
        
        centroids.add(pixels.get(random.nextInt(pixels.size())));
        
        for (int i = 1; i < k; i++) {
            double[] distances = new double[pixels.size()];
            double sumDistances = 0;
            
            for (int j = 0; j < pixels.size(); j++) {
                Color pixel = pixels.get(j);
                double minDistance = Double.MAX_VALUE;
                
                for (Color centroid : centroids) {
                    double distance = colorDistance(pixel, centroid);
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
                
                distances[j] = minDistance * minDistance; 
                sumDistances += distances[j];
            }
            
            double r = random.nextDouble() * sumDistances;
            double cumulative = 0;
            int nextCentroidIndex = 0;
            
            for (int j = 0; j < pixels.size(); j++) {
                cumulative += distances[j];
                if (cumulative >= r) {
                    nextCentroidIndex = j;
                    break;
                }
            }
            
            centroids.add(pixels.get(nextCentroidIndex));
        }
        
        for (int iteration = 0; iteration < 20; iteration++) {
            Map<Integer, List<Color>> clusters = new HashMap<>();
            for (int i = 0; i < k; i++) {
                clusters.put(i, new ArrayList<>());
            }
            
            for (Color pixel : pixels) {
                int nearestCentroid = 0;
                double minDistance = Double.MAX_VALUE;
                
                for (int i = 0; i < k; i++) {
                    double distance = colorDistance(pixel, centroids.get(i));
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestCentroid = i;
                    }
                }
                
                clusters.get(nearestCentroid).add(pixel);
            }
            
            boolean converged = true;
            for (int i = 0; i < k; i++) {
                List<Color> cluster = clusters.get(i);
                if (!cluster.isEmpty()) {
                    Color newCentroid = averageColor(cluster);
                    if (!colorsEqual(newCentroid, centroids.get(i))) {
                        centroids.set(i, newCentroid);
                        converged = false;
                    }
                }
            }
            
            if (converged) {
                break;
            }
        }
        
        return centroids;
    }
    
    private double colorDistance(Color c1, Color c2) {
        int dr = c1.getRed() - c2.getRed();
        int dg = c1.getGreen() - c2.getGreen();
        int db = c1.getBlue() - c2.getBlue();
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }
    
    private boolean colorsEqual(Color c1, Color c2) {
        return Math.abs(c1.getRed() - c2.getRed()) < 5 &&
               Math.abs(c1.getGreen() - c2.getGreen()) < 5 &&
               Math.abs(c1.getBlue() - c2.getBlue()) < 5;
    }
    
    private Color averageColor(List<Color> colors) {
        long redSum = 0, greenSum = 0, blueSum = 0;
        
        for (Color color : colors) {
            redSum += color.getRed();
            greenSum += color.getGreen();
            blueSum += color.getBlue();
        }
        
        int size = colors.size();
        return new Color(
            (int) (redSum / size),
            (int) (greenSum / size),
            (int) (blueSum / size)
        );
    }
    
    private List<String> generateTags(MultipartFile file, List<String> colors) {
        List<String> tags = new ArrayList<>();
        String filename = file.getOriginalFilename().toLowerCase();
        
        if (filename.contains("beach") || filename.contains("sea") || filename.contains("ocean")) {
            tags.add("🏖️ Beach");
        }
        if (filename.contains("birthday") || filename.contains("party") || filename.contains("celebration")) {
            tags.add("🎉 Celebration");
        }
        if (filename.contains("wedding") || filename.contains("marriage")) {
            tags.add("💒 Wedding");
        }
        if (filename.contains("travel") || filename.contains("vacation") || filename.contains("trip")) {
            tags.add("✈️ Travel");
        }
        if (filename.contains("family") || filename.contains("mom") || filename.contains("dad")) {
            tags.add("👨‍👩‍👧‍👦 Family");
        }
        if (filename.contains("friend") || filename.contains("group")) {
            tags.add("👫 Friends");
        }
        if (filename.contains("food") || filename.contains("dinner") || filename.contains("restaurant")) {
            tags.add("🍽️ Food");
        }
        if (filename.contains("nature") || filename.contains("mountain") || filename.contains("forest")) {
            tags.add("🌳 Nature");
        }
        if (filename.contains("city") || filename.contains("urban") || filename.contains("building")) {
            tags.add("🏙️ City");
        }
        
        boolean hasPink = colors.stream().anyMatch(this::isPinkTone);
        boolean hasRed = colors.stream().anyMatch(this::isRedTone);
        boolean hasBlue = colors.stream().anyMatch(this::isBlueTone);
        boolean hasGreen = colors.stream().anyMatch(this::isGreenTone);
        boolean hasWarmColors = colors.stream().anyMatch(this::isWarmColor);
        
        if (hasPink) {
            tags.add("💖 Lovely");
        }
        if (hasRed) {
            tags.add("❤️ Passionate");
        }
        if (hasBlue) {
            tags.add("💙 Calm");
        }
        if (hasGreen) {
            tags.add("💚 Natural");
        }
        if (hasWarmColors) {
            tags.add("🌅 Warm");
        }
        if (colors.stream().anyMatch(this::isCoolColor)) {
            tags.add("🌊 Cool");
        }
        
        if (tags.isEmpty()) {
            tags.add("📸 Memory");
        }
        
        return tags;
    }
    
    private String generateMood(List<String> colors, List<String> tags) {
        int pinkScore = (int) colors.stream().filter(this::isPinkTone).count();
        int redScore = (int) colors.stream().filter(this::isRedTone).count();
        int blueScore = (int) colors.stream().filter(this::isBlueTone).count();
        int greenScore = (int) colors.stream().filter(this::isGreenTone).count();
        int warmScore = (int) colors.stream().filter(this::isWarmColor).count();
        
        boolean hasRomantic = tags.stream().anyMatch(tag -> tag.contains("Romantic") || tag.contains("Wedding"));
        boolean hasCelebration = tags.stream().anyMatch(tag -> tag.contains("Celebration") || tag.contains("Party"));
        boolean hasNature = tags.stream().anyMatch(tag -> tag.contains("Nature") || tag.contains("Beach"));
        boolean hasCity = tags.stream().anyMatch(tag -> tag.contains("City"));
        
        if (hasRomantic || pinkScore >= 2) {
            return "💕 Lovely";
        } else if (hasCelebration || redScore >= 2) {
            return "🎊 Joyful";
        } else if (hasNature || greenScore >= 2) {
            return "😌 Peaceful";
        } else if (hasCity || blueScore >= 2) {
            return "🏙️ Urban";
        } else if (warmScore >= 2) {
            return "☀️ Warm";
        } else {
            return "✨ Nostalgic";
        }
    }
    
    private boolean isPinkTone(String hexColor) {
        return PINK_TONES.stream().anyMatch(pink -> hexColor.toUpperCase().contains(pink));
    }
    
    private boolean isRedTone(String hexColor) {
        return RED_TONES.stream().anyMatch(red -> hexColor.toUpperCase().contains(red));
    }
    
    private boolean isBlueTone(String hexColor) {
        return BLUE_TONES.stream().anyMatch(blue -> hexColor.toUpperCase().contains(blue));
    }
    
    private boolean isGreenTone(String hexColor) {
        return GREEN_TONES.stream().anyMatch(green -> hexColor.toUpperCase().contains(green));
    }
    
    private boolean isWarmColor(String hexColor) {
        if (!hexColor.startsWith("#")) return false;
        int red = Integer.parseInt(hexColor.substring(1, 3), 16);
        int green = Integer.parseInt(hexColor.substring(3, 5), 16);
        int blue = Integer.parseInt(hexColor.substring(5, 7), 16);
        return red > green && red > blue;
    }
    
    private boolean isCoolColor(String hexColor) {
        if (!hexColor.startsWith("#")) return false;
        int red = Integer.parseInt(hexColor.substring(1, 3), 16);
        int green = Integer.parseInt(hexColor.substring(3, 5), 16);
        int blue = Integer.parseInt(hexColor.substring(5, 7), 16);
        return (blue > red && blue > green) || (green > red && green > blue);
    }
    
    private List<String> getDefaultColorPalette() {
        return Arrays.asList("#FFB6C1", "#FF69B4", "#DC143C", "#B22222", "#8B0000");
    }
}