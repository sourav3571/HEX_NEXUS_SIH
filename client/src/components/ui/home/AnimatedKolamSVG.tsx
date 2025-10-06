import { useEffect, useRef, useState } from 'react';

interface AnimatedKolamSVGProps {
    svgUrl: string;
}

export default function AnimatedKolamSVG({ svgUrl }: AnimatedKolamSVGProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndAnimateSVG = async () => {
            try {
                setIsLoading(true);
                const url = svgUrl.startsWith("http") ? svgUrl : `${import.meta.env.VITE_API_URL}/${svgUrl}`;
                const response = await fetch(url);
                const svgText = await response.text();
                
                // Parse the SVG and add animation
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.querySelector('svg');
                
                if (svgElement) {
                    // Calculate bounding box of all elements to remove white space
                    const circles = svgElement.querySelectorAll('circle');
                    const paths = svgElement.querySelectorAll('path, line');
                    
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    
                    // Get bounds from circles
                    circles.forEach(circle => {
                        const cx = parseFloat(circle.getAttribute('cx') || '0');
                        const cy = parseFloat(circle.getAttribute('cy') || '0');
                        const r = parseFloat(circle.getAttribute('r') || '0');
                        minX = Math.min(minX, cx - r);
                        minY = Math.min(minY, cy - r);
                        maxX = Math.max(maxX, cx + r);
                        maxY = Math.max(maxY, cy + r);
                    });
                    
                    // Get bounds from paths and lines
                    paths.forEach(path => {
                        // For lines, calculate from x1, y1, x2, y2
                        if (path.tagName === 'line') {
                            const x1 = parseFloat(path.getAttribute('x1') || '0');
                            const y1 = parseFloat(path.getAttribute('y1') || '0');
                            const x2 = parseFloat(path.getAttribute('x2') || '0');
                            const y2 = parseFloat(path.getAttribute('y2') || '0');
                            minX = Math.min(minX, x1, x2);
                            minY = Math.min(minY, y1, y2);
                            maxX = Math.max(maxX, x1, x2);
                            maxY = Math.max(maxY, y1, y2);
                        } else if (path.tagName === 'path') {
                            // For paths, parse the d attribute to find all coordinates
                            const d = path.getAttribute('d') || '';
                            const coords = d.match(/[\d.]+/g)?.map(parseFloat) || [];
                            for (let i = 0; i < coords.length; i += 2) {
                                if (coords[i] !== undefined) minX = Math.min(minX, coords[i]);
                                if (coords[i] !== undefined) maxX = Math.max(maxX, coords[i]);
                                if (coords[i + 1] !== undefined) minY = Math.min(minY, coords[i + 1]);
                                if (coords[i + 1] !== undefined) maxY = Math.max(maxY, coords[i + 1]);
                            }
                        }
                    });
                    
                    // Add padding
                    const padding = 20;
                    minX -= padding;
                    minY -= padding;
                    maxX += padding;
                    maxY += padding;
                    
                    const width = maxX - minX;
                    const height = maxY - minY;
                    
                    // Update viewBox to crop white space only if we have valid bounds
                    if (isFinite(minX) && isFinite(minY) && isFinite(width) && isFinite(height)) {
                        svgElement.setAttribute('viewBox', `${minX},${minY},${width},${height}`);
                        svgElement.setAttribute('width', '100%');
                        svgElement.setAttribute('height', '100%');
                    }
                    
                    // Add CSS for animations
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes drawPath {
                            to {
                                stroke-dashoffset: 0;
                            }
                        }
                        
                        @keyframes fadeInDot {
                            from {
                                opacity: 0;
                                transform: scale(0);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                        
                        .animated-path {
                            stroke-dasharray: 1000;
                            stroke-dashoffset: 1000;
                            animation: drawPath 2s ease-in-out forwards;
                        }
                        
                        .animated-dot {
                            opacity: 0;
                            transform-origin: center;
                            animation: fadeInDot 0.3s ease-out forwards;
                        }
                    `;
                    svgElement.insertBefore(style, svgElement.firstChild);
                    
                    // Animate circles (dots) first
                    circles.forEach((circle, index) => {
                        circle.classList.add('animated-dot');
                        (circle as SVGElement).style.animationDelay = `${index * 0.01}s`;
                    });
                    
                    // Then animate paths and lines with a delay after dots
                    const dotAnimationTime = circles.length * 0.01 + 0.3; // Total dot animation time
                    
                    paths.forEach((path, index) => {
                        path.classList.add('animated-path');
                        const delay = dotAnimationTime + (index * 0.1);
                        (path as SVGElement).style.animationDelay = `${delay}s`;
                    });
                    
                    // Set the animated SVG content
                    setSvgContent(new XMLSerializer().serializeToString(svgElement));
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading SVG:', error);
                setIsLoading(false);
            }
        };

        fetchAndAnimateSVG();
    }, [svgUrl]);

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef} 
            className="w-full h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
