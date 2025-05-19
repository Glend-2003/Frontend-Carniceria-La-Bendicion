import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Compressor from 'compressorjs';

/**
 * Custom hook para gestionar la carga y compresión de imágenes
 * @param {Object} options - Opciones de configuración
 * @param {number} options.maxSizeMB - Tamaño máximo en MB
 * @param {number} options.quality - Calidad de compresión (0-1)
 * @param {function} options.onImageSelected - Callback cuando se selecciona una imagen
 * @returns {Object} Objeto con métodos y estado para manejar imágenes
 */
const useImageUpload = (options = {}) => {
  const {
    maxSizeMB = 2,         
    quality = 0.8,         
    onImageSelected = null 
  } = options;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalFileInfo, setOriginalFileInfo] = useState(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024; 

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setOriginalFileInfo(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    
    if (!file) {
      clearImage();
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo seleccionado no es una imagen válida');
      clearImage();
      return;
    }

    setOriginalFileInfo({
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    if (file.size <= maxSizeBytes && 
        !['image/png', 'image/svg+xml'].includes(file.type)) {
      setPreviewAndFile(file);
      return;
    }

    setIsCompressing(true);
    new Compressor(file, {
      quality: quality,
      maxWidth: 1200,
      maxHeight: 1200,
      convertTypes: ['image/png', 'image/webp'],
      convertSize: 1000000, 
      mimeType: 'image/jpeg',
      success(compressedFile) {
        console.log(`Imagen comprimida: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB (original: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        setPreviewAndFile(compressedFile);
        setIsCompressing(false);
        
        if (compressedFile.size > maxSizeBytes) {
          toast.warning(`La imagen ha sido comprimida pero sigue siendo grande (${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB). Considera seleccionar una imagen más pequeña.`);
        } else {
          toast.success('Imagen comprimida correctamente');
        }
      },
      error(err) {
        console.error('Error al comprimir imagen:', err);
        setIsCompressing(false);
        if (file.size <= maxSizeBytes * 1.5) {
          setPreviewAndFile(file);
          toast.warning('No se pudo comprimir la imagen, pero se usará la original');
        } else {
          toast.error(`La imagen es demasiado grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). El máximo es ${maxSizeMB}MB`);
          clearImage();
        }
      }
    });
  }, [maxSizeBytes, quality, maxSizeMB, clearImage]);

  const setPreviewAndFile = useCallback((file) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
    setImageFile(file);
    
    if (onImageSelected && typeof onImageSelected === 'function') {
      onImageSelected(file, previewURL);
    }
  }, [imagePreview, onImageSelected]);

  return {
    imageFile,
    imagePreview,
    isCompressing,
    originalFileInfo,
    handleFileChange,
    clearImage,
    maxSizeMB
  };
};

export default useImageUpload;