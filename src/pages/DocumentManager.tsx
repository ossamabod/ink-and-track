import React from 'react';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';

const DocumentManager: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Document Signature Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload, manage, and digitally sign your documents with our secure platform
          </p>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <section>
            <FileUpload />
          </section>

          {/* File List Section */}
          <section>
            <FileList />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Secure document management with digital signature capabilities
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DocumentManager;