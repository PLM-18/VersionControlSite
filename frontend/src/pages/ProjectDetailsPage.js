import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  File, 
  Folder, 
  Code, 
  FileText, 
  Settings, 
  Eye,
  Download,
  Edit,
  Search,
  ChevronRight,
  Calendar,
  User,
  GitBranch,
  Users,
  Clock
} from 'lucide-react';

const ProjectDetailPage = () => {
    const navigate = useNavigate();
  /* const navigate = useNavigate();
  const {id: projectId} = useParams();
  default to 1 for now */

  
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock project data
  const mockProject = {
    id: 1,
    name: 'E-commerce Platform',
    description: 'A modern e-commerce platform built with React and Node.js featuring real-time inventory management and payment processing.',
    type: 'TypeScript',
    version: '1.0.0',
    status: 'checked_in',
    members: [
      { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32' },
      { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/32/32' }
    ],
    ownerId: 1,
    createdAt: '2024-01-15',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    stats: {
      commits: 127,
      branches: 3,
      contributors: 2,
      filesCount: 45
    }
  };

  // Mock file structure
  const mockFiles = {
    '': [
      { name: 'src/', type: 'folder', lastModified: '2 hours ago', size: '-' },
      { name: 'public/', type: 'folder', lastModified: '1 day ago', size: '-' },
      { name: 'package.json', type: 'file', lastModified: '3 days ago', size: '2.1 KB' },
      { name: 'README.md', type: 'file', lastModified: '1 week ago', size: '1.8 KB' },
      { name: 'tsconfig.json', type: 'file', lastModified: '2 weeks ago', size: '854 B' },
      { name: '.gitignore', type: 'file', lastModified: '1 month ago', size: '342 B' }
    ],
    'src/': [
      { name: '../', type: 'folder', isParent: true },
      { name: 'components/', type: 'folder', lastModified: '2 hours ago', size: '-' },
      { name: 'pages/', type: 'folder', lastModified: '5 hours ago', size: '-' },
      { name: 'utils/', type: 'folder', lastModified: '1 day ago', size: '-' },
      { name: 'App.tsx', type: 'file', lastModified: '2 hours ago', size: '3.2 KB' },
      { name: 'index.tsx', type: 'file', lastModified: '1 week ago', size: '756 B' },
      { name: 'styles.css', type: 'file', lastModified: '3 days ago', size: '12.4 KB' }
    ],
    'src/components/': [
      { name: '../', type: 'folder', isParent: true },
      { name: 'Header.tsx', type: 'file', lastModified: '2 hours ago', size: '2.8 KB' },
      { name: 'ProductCard.tsx', type: 'file', lastModified: '4 hours ago', size: '1.9 KB' },
      { name: 'Cart.tsx', type: 'file', lastModified: '1 day ago', size: '4.1 KB' },
      { name: 'Footer.tsx', type: 'file', lastModified: '3 days ago', size: '1.2 KB' }
    ],
    'public/': [
      { name: '../', type: 'folder', isParent: true },
      { name: 'index.html', type: 'file', lastModified: '1 day ago', size: '1.1 KB' },
      { name: 'favicon.ico', type: 'file', lastModified: '1 week ago', size: '15.2 KB' },
      { name: 'manifest.json', type: 'file', lastModified: '1 week ago', size: '492 B' }
    ]
  };

  const mockFileContents = {
    'package.json': `{
  "name": "ecommerce-platform",
  "version": "1.0.0",
  "description": "Modern e-commerce platform",
  "main": "src/index.tsx",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "typescript": "^4.9.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}`,
    'README.md': `# E-commerce Platform

A modern, scalable e-commerce platform built with React, TypeScript, and Node.js.

## Features

- 🛒 Shopping cart functionality
- 💳 Secure payment processing
- 📱 Responsive design
- 🔍 Product search and filtering
- 👤 User authentication
- 📊 Admin dashboard

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Technologies Used

- React 18
- TypeScript
- Node.js
- Express
- MongoDB
- Stripe API

## Contributing

Please read our contributing guidelines before submitting pull requests.`,
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}`,
    '.gitignore': `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*`,
    'src/App.tsx': `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './components/Cart';
import Footer from './components/Footer';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;`,
    'src/index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    'src/components/Header.tsx': `import React from 'react';
import { ShoppingCart, Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">
          ShopSphere
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <User size={24} />
          </button>
          <div className="p-2 text-gray-600 hover:text-gray-800 relative cursor-pointer">
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;`,
    'src/components/ProductCard.tsx': `import React from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            \${product.price}
          </span>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-gray-600">{product.rating}</span>
          </div>
        </div>
        <div className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          View Details
        </div>
      </div>
    </div>
  );
};

export default ProductCard;`
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProject(mockProject);
      setFiles(mockFiles[currentPath] || []);
      setLoading(false);
    }, 500);
  }, [currentPath]);

  const getFileIcon = (fileName, type) => {
    if (type === 'folder') return <Folder className="text-blue-400" size={20} />;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return <Code className="text-yellow-400" size={20} />;
      case 'json':
        return <Settings className="text-green-400" size={20} />;
      case 'md':
        return <FileText className="text-blue-400" size={20} />;
      case 'css':
        return <Code className="text-purple-400" size={20} />;
      case 'html':
        return <Code className="text-orange-400" size={20} />;
      default:
        return <File className="text-gray-400" size={20} />;
    }
  };

  const handleFileClick = (file) => {
    if (file.type === 'folder') {
      if (file.isParent) {
        const pathParts = currentPath.split('/').filter(p => p);
        pathParts.pop();
        setCurrentPath(pathParts.length > 0 ? pathParts.join('/') + '/' : '');
      } else {
        setCurrentPath(currentPath + file.name);
      }
      setSelectedFile(null);
      setFileContent('');
    } else {
      const filePath = currentPath + file.name;
      setSelectedFile(file);
      setFileContent(mockFileContents[filePath] || `// Content of ${file.name}\n// This is a preview of the file content.\n\n// File: ${filePath}\n// Size: ${file.size}\n// Last Modified: ${file.lastModified}`);
    }
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return ['Root'];
    const parts = currentPath.split('/').filter(p => p);
    return ['Root', ...parts];
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffHours < 168) {
      return `${Math.floor(diffHours / 24)} days ago`;
    } else {
      return `${Math.floor(diffHours / 168)} weeks ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loading w-8 h-8"></div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/projects')}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} onClick={() => navigate('/projects')} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{project?.name}</h1>
                        <p className="text-gray-400">{project?.description}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded">
                        {project?.type}
                    </span>
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded">
                        v{project?.version}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded ${
                        project?.status === 'checked_out' 
                            ? 'bg-orange-600 text-orange-100' 
                            : 'bg-green-600 text-green-100'
                    }`}>
                        {project?.status === 'checked_out' ? 'Checked Out' : 'Available'}
                    </span>
                </div>
            </div>
        </header>

        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                        <GitBranch className="text-green-400" size={16} />
                        <span className="text-sm text-gray-300">{project?.stats.commits} commits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Code className="text-blue-400" size={16} />
                        <span className="text-sm text-gray-300">{project?.stats.filesCount} files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Users className="text-purple-400" size={16} />
                        <span className="text-sm text-gray-300">{project?.stats.contributors} contributors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="text-yellow-400" size={16} />
                        <span className="text-sm text-gray-300">Updated {formatDate(project?.updatedAt)}</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    {project?.members.map((member, index) => (
                        <img
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full border-2 border-gray-600"
                            title={member.name}
                            style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                        />
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-gray-800 px-6 border-b border-gray-700">
            <div className="flex space-x-8">
                {['files', 'activity', 'contributors'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                            activeTab === tab
                                ? 'border-green-500 text-green-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {activeTab === 'files' ? (
            <div className="flex h-screen">
                <div className="w-1/2 border-r border-gray-700 flex flex-col">
                    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-2 text-sm">
                            {getBreadcrumbs().map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight size={14} className="text-gray-500" />}
                                    <button
                                        onClick={() => {
                                            if (index === 0) {
                                                setCurrentPath('');
                                            } else {
                                                const pathParts = getBreadcrumbs().slice(1, index + 1);
                                                setCurrentPath(pathParts.join('/') + '/');
                                            }
                                        }}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {crumb}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredFiles.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                                <File size={48} className="mx-auto mb-2 opacity-30" />
                                <p>No files found</p>
                            </div>
                        ) : (
                            filteredFiles.map((file, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleFileClick(file)}
                                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-800 ${
                                        selectedFile?.name === file.name ? 'bg-gray-800' : ''
                                    }`}
                                >
                                    {getFileIcon(file.name, file.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white truncate">{file.name}</p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                                            <span>{file.lastModified}</span>
                                            <span>{file.size}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    {selectedFile ? (
                        <>
                            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getFileIcon(selectedFile.name, selectedFile.type)}
                                        <div>
                                            <h3 className="font-semibold">{selectedFile.name}</h3>
                                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar size={12} />
                                                    <span>{selectedFile.lastModified}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <File size={12} />
                                                    <span>{selectedFile.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                                            <Download size={16} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap">
                                    {fileContent}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <Eye size={64} className="mx-auto mb-4 opacity-30" />
                                <h3 className="text-xl font-semibold mb-2">Select a file to view</h3>
                                <p>Click on any file in the explorer to preview its contents</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ) : activeTab === 'activity' ? (
            <div className="p-6">
                <div className="text-center text-gray-400">
                    <Clock size={64} className="mx-auto mb-4 opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">Project Activity</h3>
                    <p>Recent commits, merges, and project updates will appear here</p>
                </div>
            </div>
        ) : (
            <div className="p-6 flex flex-wrap gap-6 justify-center">
                {project?.members.map((member) => (
                    <div
                        key={member.id}
                        className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center w-64"
                    >
                        <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-20 h-20 rounded-full border-4 border-green-500 mb-4"
                        />
                        <h3 className="text-lg font-semibold text-white mb-2">{member.name}</h3>
                        <span className="text-sm text-gray-400">Contributor</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);
};

export default ProjectDetailPage;