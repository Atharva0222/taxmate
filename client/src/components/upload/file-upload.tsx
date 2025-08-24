import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

export default function FileUpload({ 
  onFileSelect, 
  disabled = false, 
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeTypeMatches = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return type === fileExtension;
      }
      return file.type.match(type);
    });

    if (!mimeTypeMatches) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a file with one of these formats: ${accept}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card 
      className={`border-2 border-dashed transition-all cursor-pointer ${
        isDragging 
          ? 'border-primary bg-blue-50' 
          : disabled 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
          : 'border-gray-300 hover:border-primary hover:bg-blue-50'
      }`}
      data-testid="file-upload-zone"
    >
      <CardContent
        className="p-8 text-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          data-testid="file-input"
        />
        
        <div className="mb-4">
          <i className={`fas fa-cloud-upload-alt text-4xl ${
            disabled ? 'text-gray-400' : isDragging ? 'text-primary' : 'text-gray-400'
          }`}></i>
        </div>
        
        <h3 className={`text-lg font-semibold mb-2 ${
          disabled ? 'text-gray-400' : 'text-gray-900'
        }`}>
          {isDragging ? 'Drop your Form 16 here' : 'Drop your Form 16 here'}
        </h3>
        
        <p className={`mb-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          Supports {accept.replace(/\./g, '').toUpperCase()} • Max {(maxSize / (1024 * 1024)).toFixed(0)}MB
        </p>
        
        <Button 
          variant={disabled ? "outline" : "default"}
          disabled={disabled}
          className={disabled ? "cursor-not-allowed" : ""}
          data-testid="button-choose-file"
        >
          <i className="fas fa-file-upload mr-2"></i>
          {disabled ? 'Processing...' : 'Choose File'}
        </Button>
        
        {isDragging && !disabled && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-primary font-semibold">
              <i className="fas fa-download mr-2"></i>
              Drop to upload
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
