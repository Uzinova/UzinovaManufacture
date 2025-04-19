import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Grid, Environment, useProgress } from '@react-three/drei';
import { Mesh, Box3, Vector3, MeshStandardMaterial, Color, DoubleSide, Object3D } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import './ModelViewer.css';

interface ModelViewerProps {
  modelUrl: string;
}

// Loading component
function Loader() {
  const { progress, active } = useProgress();
  return active ? (
    <div className="model-loading">
      <div className="model-loading-spinner"></div>
      <div className="model-loading-text">Loading model... {progress.toFixed(0)}%</div>
    </div>
  ) : null;
}

// Debug component to show when model fails to load
function DebugSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#fb923c" />
    </mesh>
  );
}

// Model component renders the actual 3D model
function Model({ url }: { url: string }) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    console.log("Loading model from URL:", url);
    
    // Determine file extension - handle blob URLs differently
    let fileExtension = '';
    if (url.startsWith('blob:')) {
      // For blob URLs, we need to extract the extension from the filename in the URL if possible
      // Otherwise, we'll try to infer from the content or just try STL as default
      console.log("Detected blob URL, attempting to determine format...");
      
      // Try to extract extension from query params or path if present
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      if (lastPart.includes('.')) {
        fileExtension = lastPart.split('.').pop()?.toLowerCase() || '';
      }
      
      // If we couldn't determine extension, default to STL
      if (!fileExtension) {
        console.log("Could not determine file extension from blob URL, defaulting to STL");
        fileExtension = 'stl';
      }
    } else {
      fileExtension = url.split('.').pop()?.toLowerCase() || '';
    }
    
    console.log("File extension determined as:", fileExtension);
    
    // Create a material
    const material = new MeshStandardMaterial({
      color: new Color(0xfb923c), // Primary color from your theme
      roughness: 0.5,
      metalness: 0.2,
      side: DoubleSide, // Render both sides of faces
    });
    
    const loadModel = async () => {
      try {
        setIsLoaded(false);
        setHasError(false);
        
        // Clear any existing children
        while (groupRef.current && groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
        
        if (fileExtension === 'stl' || url.startsWith('blob:')) {
          console.log("Loading STL model...");
          const loader = new STLLoader();
          
          // For blob URLs, we need to fetch the data first
          if (url.startsWith('blob:')) {
            console.log("Fetching blob data...");
            try {
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              console.log("Blob data fetched successfully, parsing...");
              
              try {
                const geometry = loader.parse(arrayBuffer);
                console.log("STL parsed successfully from blob, creating mesh...");
                
                // Ensure geometry has normals
                geometry.computeVertexNormals();
                
                const mesh = new Mesh(geometry, material);
                if (groupRef.current) {
                  groupRef.current.add(mesh);
                  console.log("Mesh added to scene:", mesh);
                  
                  // Center the model by adjusting its pivot point
                  centerModelPivot(mesh);
                }
              } catch (parseError) {
                console.error("Error parsing STL from blob:", parseError);
                setHasError(true);
              }
            } catch (fetchError) {
              console.error("Error fetching blob data:", fetchError);
              setHasError(true);
            }
          } else {
            // Regular URL loading
            loader.load(
              url,
              (geometry) => {
                console.log("STL loaded successfully, creating mesh...");
                // Ensure geometry has normals
                geometry.computeVertexNormals();
                
                const mesh = new Mesh(geometry, material);
                if (groupRef.current) {
                  groupRef.current.add(mesh);
                  console.log("Mesh added to scene:", mesh);
                  
                  // Center the model by adjusting its pivot point
                  centerModelPivot(mesh);
                }
              },
              (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
              },
              (error) => {
                console.error("Error loading STL:", error);
                setHasError(true);
              }
            );
          }
        } 
        else if (fileExtension === 'obj') {
          console.log("Loading OBJ model...");
          const loader = new OBJLoader();
          
          // For blob URLs, we need to fetch the data first
          if (url.startsWith('blob:')) {
            console.log("Fetching blob data for OBJ...");
            try {
              const response = await fetch(url);
              const text = await response.text();
              console.log("Blob data fetched successfully for OBJ, parsing...");
              
              try {
                const object = loader.parse(text);
                console.log("OBJ parsed successfully from blob:", object);
                
                // Apply material to all meshes in the loaded object
                object.traverse((child) => {
                  if (child instanceof Mesh) {
                    child.material = material;
                    // Ensure geometry has normals
                    if (child.geometry) {
                      child.geometry.computeVertexNormals();
                    }
                  }
                });
                
                if (groupRef.current) {
                  groupRef.current.add(object);
                  console.log("Object added to scene:", object);
                  
                  // Center the model by adjusting its pivot point
                  centerModelPivot(object);
                }
              } catch (parseError) {
                console.error("Error parsing OBJ from blob:", parseError);
                setHasError(true);
              }
            } catch (fetchError) {
              console.error("Error fetching blob data for OBJ:", fetchError);
              setHasError(true);
            }
          } else {
            // Regular URL loading
            loader.load(
              url,
              (object) => {
                console.log("OBJ loaded successfully:", object);
                // Apply material to all meshes in the loaded object
                object.traverse((child) => {
                  if (child instanceof Mesh) {
                    child.material = material;
                    // Ensure geometry has normals
                    if (child.geometry) {
                      child.geometry.computeVertexNormals();
                    }
                  }
                });
                
                if (groupRef.current) {
                  groupRef.current.add(object);
                  console.log("Object added to scene:", object);
                  
                  // Center the model by adjusting its pivot point
                  centerModelPivot(object);
                }
              },
              (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
              },
              (error) => {
                console.error("Error loading OBJ:", error);
                setHasError(true);
              }
            );
          }
        } else {
          console.error("Unsupported file format:", fileExtension);
          setHasError(true);
        }
      } catch (error) {
        console.error("Error in loadModel function:", error);
        setHasError(true);
      }
    };
    
    // Function to center the model by adjusting its pivot point
    const centerModelPivot = (object: Object3D) => {
      if (!object) return;
      
      console.log("Centering model pivot point...");
      
      // Calculate bounding box
      const box = new Box3().setFromObject(object);
      const center = new Vector3();
      box.getCenter(center);
      const size = box.getSize(new Vector3());
      
      console.log("Model original center:", center);
      console.log("Model size:", size);
      
      // If the model is a mesh with geometry, adjust the geometry directly
      if (object instanceof Mesh && object.geometry) {
        console.log("Adjusting mesh geometry position...");
        
        // Translate the geometry to center it at the origin
        object.geometry.translate(-center.x, -center.y, -center.z);
        
        // Reset the mesh position
        object.position.set(0, 0, 0);
      } 
      // For more complex objects (like OBJ with multiple meshes)
      else {
        console.log("Adjusting complex object position...");
        
        // Create a parent container for the object
        const container = new Object3D();
        
        // Remove from current parent (the group)
        if (object.parent) {
          const parent = object.parent;
          parent.remove(object);
          
          // Add the container to the parent
          parent.add(container);
          
          // Add the object to the container
          container.add(object);
          
          // Move the object within the container to center it
          object.position.set(-center.x, -center.y, -center.z);
          
          // Position the container at the origin
          container.position.set(0, 0, 0);
        }
      }
      
      // Apply a reasonable scale based on the model size
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 2; // Target size in world units
      const scale = targetSize / maxDimension;
      
      console.log("Applying scale:", scale);
      
      // Apply scale to the group containing the model
      if (groupRef.current) {
        groupRef.current.scale.set(scale, scale, scale);
        
        // Position the group at the origin
        groupRef.current.position.set(0, 0, 0);
      }
      
      // Set camera to a fixed position
      camera.position.set(3, 3, 3);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      
      setIsLoaded(true);
      console.log("Model pivot centered and positioned");
    };
    
    loadModel();
    
    // Set up scene
    scene.background = null; // Transparent background
    
    return () => {
      // Cleanup
      if (groupRef.current) {
        while (groupRef.current.children.length > 0) {
          const child = groupRef.current.children[0];
          if (child instanceof Mesh && child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
          groupRef.current.remove(child);
        }
      }
    };
  }, [url, camera, scene]);
  
  // Slow rotation effect
  useFrame((state) => {
    if (groupRef.current && isLoaded) {
      groupRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <>
      <group ref={groupRef} />
      {hasError && <DebugSphere />}
    </>
  );
}

// Main component
export function ModelViewer({ modelUrl }: ModelViewerProps) {
  const [key, setKey] = useState(0); // Force re-render when needed
  const controlsRef = useRef(null);

  // Reset view function
  const resetView = () => {
    setKey(prevKey => prevKey + 1);
  };

  // Validate URL - also accept blob URLs
  const isValidUrl = modelUrl && (
    modelUrl.startsWith('blob:') || 
    modelUrl.endsWith('.stl') || 
    modelUrl.endsWith('.obj') || 
    modelUrl.endsWith('.3mf')
  );

  console.log("ModelViewer rendering with URL:", modelUrl);
  console.log("Is valid URL:", isValidUrl);

  return (
    <div className="model-viewer-container">
      <div className="model-viewer-canvas">
        <Canvas 
          key={key}
          shadows 
          dpr={[1, 2]} // Responsive pixel ratio
          gl={{ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
          }}
          camera={{ 
            position: [3, 3, 3], // Initial camera position
            fov: 40, // Narrow field of view for better focus
            near: 0.1,
            far: 1000
          }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.8} />
            <spotLight 
              position={[10, 10, 10]} 
              angle={0.15} 
              penumbra={1} 
              intensity={1} 
              castShadow 
            />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            {/* Environment map for realistic reflections */}
            <Environment preset="sunset" />
            
            {/* Model - removed Center component to avoid interference */}
            {isValidUrl ? (
              <Model url={modelUrl} />
            ) : (
              <DebugSphere />
            )}
            
            {/* Controls and helpers */}
            <OrbitControls 
              ref={controlsRef}
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={0.1} // Allow close zoom
              maxDistance={20}
              makeDefault
            />
            <Grid 
              infiniteGrid 
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#fb923c"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#fb923c"
              fadeDistance={10}
              fadeStrength={1.5}
              position={[0, -0.5, 0]} // Grid positioned below model
            />
          </Suspense>
        </Canvas>
      </div>
      
      <Loader />
      
      <div className="model-controls">
        <button 
          className="model-control-button" 
          title="Reset View"
          onClick={resetView}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
            <path d="M12 8v4l2 2"></path>
          </svg>
        </button>
      </div>
      
      {!isValidUrl && (
        <div className="model-error-message">
          <p>Invalid model URL or unsupported format</p>
          <p className="model-error-url">{modelUrl}</p>
        </div>
      )}
    </div>
  );
}
