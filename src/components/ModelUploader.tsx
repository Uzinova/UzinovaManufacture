import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, File, CheckCircle } from 'lucide-react';
 import {   Vector3 } from 'three';

interface ModelUploaderProps {
  onModelUpload: (file: File, dimensions: any) => void;
}

export function ModelUploader({ onModelUpload }: ModelUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const calculateDimensions = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    
    const fileReader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    fileReader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file");
        }
        
        // For STL files - we can calculate dimensions directly
        if (fileExtension === 'stl') {
          const loader = new STLLoader();
          const geometry = loader.parse(event.target.result as ArrayBuffer);
          
          if (!geometry) {
            throw new Error("Failed to parse STL file");
          }
          
          // Calculate dimensions
          geometry.computeBoundingBox();
          const box = geometry.boundingBox!;
          
          const width = box.max.x - box.min.x;
          const height = box.max.y - box.min.y;
          const depth = box.max.z - box.min.z;
          
          // Calculate volume (approximate for STL)
          let volume = 0;
          const positions = geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 9) {
            const v1 = new Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const v2 = new Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
            const v3 = new Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);
            
            // Calculate volume of tetrahedron formed by triangle and origin
            const tetraVolume = Math.abs(v1.dot(v2.cross(v3))) / 6;
            volume += tetraVolume;
          }
          
          const dimensions = {
            width,
            height,
            depth,
            volume
          };
          
          setUploadedFile(file);
          onModelUpload(file, dimensions);
        } 
        // For other file types (OBJ, 3MF) - provide approximate dimensions based on file size
        else {
          const fileSizeMB = file.size / (1024 * 1024);
          // Very rough estimation
          const estimatedVolume = fileSizeMB * 1000; // 1MB ~= 1000mm³ (very approximate)
          const estimatedSize = Math.cbrt(estimatedVolume);
          
          const dimensions = {
            width: estimatedSize,
            height: estimatedSize,
            depth: estimatedSize,
            volume: estimatedVolume
          };
          
          setUploadedFile(file);
          onModelUpload(file, dimensions);
        }
        
      } catch (err) {
        console.error("Error processing 3D model:", err);
        setError("Model dosyası işlenirken bir hata oluştu. Desteklenen bir format kullanın.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fileReader.onerror = () => {
      setError("Dosya okunamadı. Lütfen tekrar deneyin.");
      setIsLoading(false);
    };
    
    // Read the file based on extension
    if (fileExtension === 'stl') {
      fileReader.readAsArrayBuffer(file);
    } else {
      // For other formats, just use file size for approximation
      fileReader.readAsText(file);
    }
  }, [onModelUpload]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError("Lütfen desteklenen bir dosya yükleyin (STL, OBJ, 3MF)");
      return;
    }
    
    const file = acceptedFiles[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['stl', 'obj', '3mf'].includes(fileExtension || '')) {
      setError("Desteklenmeyen dosya formatı. Lütfen STL, OBJ veya 3MF dosyası yükleyin.");
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError("Dosya boyutu çok büyük. Maksimum 50MB boyutunda dosya yükleyebilirsiniz.");
      return;
    }
    
    calculateDimensions(file);
    
  }, [calculateDimensions]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'model/3mf': ['.3mf'],
    },
    maxFiles: 1,
    multiple: false
  });
  
  return (
    <div>
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-accent-foreground/20 hover:border-primary/50 hover:bg-accent-foreground/5'}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center">
            <Upload className={`h-12 w-12 mb-4 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
            {isDragActive ? (
              <p className="font-medium text-center">Dosyanızı buraya bırakın...</p>
            ) : (
              <>
                <p className="font-medium text-center mb-2">STL, OBJ veya 3MF dosyanızı sürükleyin</p>
                <p className="text-sm text-gray-400 text-center">veya dosya seçmek için tıklayın</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <div className="flex items-start">
            <div className="p-2 bg-primary/20 rounded-lg mr-3">
              <File className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-medium">{uploadedFile.name}</p>
                <CheckCircle className="h-4 w-4 text-primary ml-2" />
              </div>
              <p className="text-sm text-gray-400">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
                setError(null);
              }}
              className="text-gray-400 hover:text-foreground transition-colors"
            >
              Değiştir
            </button>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <p className="text-sm text-blue-400">Model işleniyor...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Desteklenen formatlar: STL, OBJ, 3MF</p>
        <p>Maksimum dosya boyutu: 50MB</p>
      </div>
    </div>
  );
}
