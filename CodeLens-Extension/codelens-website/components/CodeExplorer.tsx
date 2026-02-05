'use client';

import { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    File, Folder, ChevronRight, ChevronDown, Code, Image as ImageIcon,
    Binary, Search, Plus, Trash2, Edit3, Save, X, FilePlus, FolderPlus,
    Maximize2, HardDrive, Terminal, Cpu, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FileNode {
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    content?: string;
    path: string;
    isBinary?: boolean;
    size?: number; // In bytes
}

const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

interface FileExplorerProps {
    files: FileNode[];
    onFileSelect: (file: FileNode) => void;
    onFileCreate: (parentPath: string, type: 'file' | 'folder') => void;
    onFileDelete: (path: string) => void;
    onFileRename: (path: string, newName: string) => void;
}

export default function FileExplorer({
    files,
    onFileSelect,
    onFileCreate,
    onFileDelete,
    onFileRename
}: FileExplorerProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', '']));
    const [searchQuery, setSearchQuery] = useState('');
    const [renamingPath, setRenamingPath] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const toggleFolder = (path: string) => {
        const newSet = new Set(expandedFolders);
        if (newSet.has(path)) newSet.delete(path);
        else newSet.add(path);
        setExpandedFolders(newSet);
    };

    const calculateTotalSize = (nodes: FileNode[]): number => {
        return nodes.reduce((acc, node) => {
            if (node.type === 'folder') return acc + calculateTotalSize(node.children || []);
            return acc + (node.size || 0);
        }, 0);
    };

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
        if (!searchQuery) return nodes;
        return nodes.reduce((acc: FileNode[], node) => {
            const matches = node.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (node.type === 'folder') {
                const childMatches = filterNodes(node.children || []);
                if (matches || childMatches.length > 0) {
                    acc.push({ ...node, children: childMatches });
                }
            } else if (matches) {
                acc.push(node);
            }
            return acc;
        }, []);
    };

    const handleRenameSubmit = (path: string) => {
        if (newName.trim()) {
            onFileRename(path, newName.trim());
        }
        setRenamingPath(null);
        setNewName('');
    };

    const renderNode = (node: FileNode, depth = 0) => {
        const isExpanded = expandedFolders.has(node.path);
        const isRenaming = renamingPath === node.path;

        if (node.type === 'folder') {
            return (
                <div key={`${node.path}-${node.type}`} className="select-none">
                    <div
                        className="group flex items-center justify-between px-4 py-2 hover:bg-primary/5 cursor-pointer transition-all border-l-2 border-transparent hover:border-primary/30"
                        style={{ paddingLeft: `${depth * 1.2 + 1}rem` }}
                    >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => toggleFolder(node.path)}>
                            <div className="w-4 h-4 flex items-center justify-center">
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                            </div>
                            <Folder className={`w-4 h-4 ${isExpanded ? 'text-primary' : 'text-muted-foreground/60'}`} />
                            {isRenaming ? (
                                <input
                                    className="bg-muted/50 border border-primary/50 rounded px-1.5 py-0.5 text-[11px] outline-none w-full font-mono focus:ring-1 ring-primary/30"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onBlur={() => handleRenameSubmit(node.path)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(node.path)}
                                />
                            ) : (
                                <span className={`text-[11px] font-bold tracking-tight truncate ${isExpanded ? 'text-foreground' : 'text-muted-foreground'}`}>{node.name}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <button onClick={() => onFileCreate(node.path, 'file')} className="p-1 hover:bg-primary/10 rounded" title="New File"><FilePlus className="w-3 h-3 text-primary" /></button>
                            <button onClick={() => { setRenamingPath(node.path); setNewName(node.name); }} className="p-1 hover:bg-primary/10 rounded" title="Rename"><Edit3 className="w-3 h-3 text-primary" /></button>
                            <button onClick={() => onFileDelete(node.path)} className="p-1 hover:bg-red-500/10 rounded" title="Delete"><Trash2 className="w-3 h-3 text-red-500" /></button>
                        </div>
                    </div>
                    {isExpanded && (
                        <div className="relative">
                            <div className="absolute left-[1.45rem] top-0 bottom-0 w-[1px] bg-border/20" />
                            {node.children?.map(child => renderNode(child, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                key={`${node.path}-${node.type}`}
                className="group flex items-center justify-between px-4 py-2 hover:bg-primary/5 cursor-pointer transition-all border-l-2 border-transparent hover:border-primary pr-2"
                style={{ paddingLeft: `${depth * 1.2 + 1.2}rem` }}
            >
                <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => onFileSelect(node)}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {getLocationIcon(node.name)}
                    </div>
                    {isRenaming ? (
                        <input
                            className="bg-muted/50 border border-primary/50 rounded px-1.5 py-0.5 text-[11px] outline-none w-full font-mono focus:ring-1 ring-primary/30"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={() => handleRenameSubmit(node.path)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(node.path)}
                        />
                    ) : (
                        <div className="flex items-baseline justify-between w-full">
                            <span className="text-[11px] font-medium truncate text-muted-foreground group-hover:text-foreground group-hover:font-bold transition-all">{node.name}</span>
                            <span className="text-[9px] opacity-0 group-hover:opacity-40 transition-opacity font-mono tracking-tighter ml-2 shrink-0">{formatSize(node.size)}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2">
                    <button onClick={() => { setRenamingPath(node.path); setNewName(node.name); }} className="p-1 hover:bg-primary/10 rounded" title="Rename"><Edit3 className="w-3 h-3 text-primary" /></button>
                    <button onClick={() => onFileDelete(node.path)} className="p-1 hover:bg-red-500/10 rounded" title="Delete"><Trash2 className="w-3 h-3 text-red-500" /></button>
                </div>
            </div>
        );
    };

    const filteredFiles = filterNodes(files);
    const totalSize = calculateTotalSize(files);

    return (
        <div className="bg-card h-full flex flex-col border-r border-border/50">
            <div className="p-5 border-b border-border/30 bg-muted/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Cpu className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground leading-none block">Mission Control</span>
                            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1 block">Live Workspace</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onFileCreate('', 'file')} title="New File" className="p-2 hover:bg-primary/10 rounded-lg transition-all text-primary border border-transparent hover:border-primary/20"><FilePlus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onFileCreate('', 'folder')} title="New Folder" className="p-2 hover:bg-primary/10 rounded-lg transition-all text-primary border border-transparent hover:border-primary/20"><FolderPlus className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Deep search files..."
                        className="w-full bg-muted/30 border-2 border-border/30 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary/50 focus:bg-background outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 scroller-premium">
                {filteredFiles.map(node => renderNode(node))}
                {filteredFiles.length === 0 && (
                    <div className="p-8 text-center flex flex-col items-center gap-3">
                        <Search className="w-8 h-8 text-muted-foreground/20" />
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-black">Null Scan: No Matches</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border/30 bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                    <Terminal className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">Payload: {formatSize(totalSize)}</span>
                </div>
            </div>
        </div>
    );
}

function getLocationIcon(filename: string) {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'svg':
        case 'gif':
            return <ImageIcon className="w-3.5 h-3.5 text-purple-500" />;
        case 'json':
            return <span className="text-[9px] font-black text-amber-500 flex items-center h-4 w-4 justify-center">{'{}'}</span>;
        case 'js':
        case 'ts':
        case 'tsx':
        case 'jsx':
            return <span className="text-[9px] font-black text-blue-500 flex items-center h-4 w-4 justify-center">JS</span>;
        case 'css':
            return <span className="text-[9px] font-black text-sky-500 flex items-center h-4 w-4 justify-center">#</span>;
        case 'md':
            return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
        default:
            return <File className="w-3.5 h-3.5 text-muted-foreground/40" />;
    }
}

interface CodeViewerProps {
    file: FileNode | null;
    highlightLine?: number | null;
    onSaveContent?: (path: string, content: string) => void;
}

export function CodeViewer({ file, highlightLine, onSaveContent }: CodeViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        if (file) {
            setEditContent(file.content || '');
            setIsEditing(false);
        }
    }, [file]);

    useEffect(() => {
        if (highlightLine && containerRef.current && !isEditing) {
            const timer = setTimeout(() => {
                const lines = containerRef.current?.querySelectorAll('.prism-line');
                const targetLine = lines?.[highlightLine - 1] as HTMLElement;
                if (targetLine) {
                    targetLine.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }, 30);
            return () => clearTimeout(timer);
        }
    }, [highlightLine, file, isEditing]);

    if (!file) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-card p-20 text-center">
                <div className="w-32 h-32 rounded-full bg-primary/5 border-2 border-primary/10 flex items-center justify-center mb-8 animate-pulse">
                    <Code className="w-12 h-12 text-primary opacity-20" />
                </div>
                <h3 className="text-2xl font-black uppercase text-foreground mb-2">Workspace Idle</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Select a target file for deep scan</p>
            </div>
        );
    }

    const extension = file.name?.split('.').pop()?.toLowerCase() || 'text';
    const isImage = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(extension);
    const languageMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'json': 'json',
        'html': 'html',
        'css': 'css',
        'md': 'markdown'
    };

    const handleSave = () => {
        if (onSaveContent) {
            onSaveContent(file.path, editContent);
        }
        setIsEditing(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-card">
            {/* Ultra-Premium Header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/10 relative z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <Terminal className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">{file.name}</h2>
                    </div>
                    <div className="h-4 w-[1px] bg-border/40 mx-2" />
                    <span className="text-[9px] font-black font-mono text-muted-foreground/60 tracking-wider">
                        {file.path}
                    </span>
                    {highlightLine && !isEditing && (
                        <span className="text-[9px] font-black bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse ml-2">
                            Focused: {highlightLine}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!isImage && !file.isBinary && (
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="save-cancel"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-2"
                                >
                                    <button
                                        onClick={() => { setIsEditing(false); setEditContent(file.content || ''); }}
                                        className="flex items-center gap-2 px-5 py-2 bg-muted hover:bg-muted/80 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-border/50"
                                    >
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95"
                                    >
                                        <Save className="w-3.5 h-3.5" /> Commit Changes
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="edit"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary/5 border border-primary/20 hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-primary transition-all active:scale-95 group"
                                >
                                    <Edit3 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> Edit Payload
                                </motion.button>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            <div ref={containerRef} className="flex-1 overflow-auto bg-card relative scroller-premium">
                {isImage && file.content?.startsWith('data:image') ? (
                    <div className="flex flex-col items-center justify-center h-full p-16 bg-muted/5">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-4 border-muted rounded-[2rem] p-6 bg-card shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <img src={file.content} alt={file.name || 'Image'} className="max-w-[80vw] max-h-[50vh] object-contain rounded-xl shadow-sm" />
                            <div className="mt-8 flex justify-between items-center opacity-60">
                                <span className="text-[10px] font-black uppercase tracking-widest">{file.name}</span>
                                <span className="text-[10px] font-mono">{formatSize(file.size)}</span>
                            </div>
                        </motion.div>
                    </div>
                ) : file.isBinary || (file.content === '[Binary Data]') ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-20">
                        <div className="w-24 h-24 bg-muted border-2 border-border/50 rounded-3xl flex items-center justify-center mb-8">
                            <Binary className="w-10 h-10 opacity-20" />
                        </div>
                        <h4 className="text-xl font-black uppercase text-foreground mb-2">Binary Object</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Non-textual data stream</p>
                    </div>
                ) : isEditing ? (
                    <div className="w-full h-full relative">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-full p-10 bg-muted/5 text-foreground font-mono text-[13px] outline-none resize-none leading-loose selection:bg-primary/30"
                            style={{ fontFamily: '"SF Mono", "Fira Code", monospace' }}
                            placeholder="Enter code payload..."
                        />
                        <div className="absolute bottom-10 right-10 flex gap-4 pointer-events-none">
                            <div className="px-4 py-2 bg-card/80 backdrop-blur border border-border/50 rounded-xl shadow-2xl">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Lines: {editContent.split('\n').length}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <SyntaxHighlighter
                        language={languageMap[extension] || 'text'}
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            padding: '2rem',
                            background: 'transparent',
                            height: '100%',
                            fontSize: '13px',
                            lineHeight: '1.7',
                            fontFamily: '"SF Mono", "Fira Code", monospace'
                        }}
                        showLineNumbers={true}
                        lineNumberStyle={{ minWidth: '4em', paddingRight: '1.5em', color: 'var(--muted-foreground)', textAlign: 'right', opacity: 0.3 }}
                        wrapLines={true}
                        lineProps={(line) => {
                            const style: any = { display: 'block' };
                            if (line === highlightLine) {
                                Object.assign(style, {
                                    backgroundColor: 'rgba(79, 70, 229, 0.15)',
                                    borderLeft: '4px solid var(--primary)',
                                    marginRight: '2rem'
                                });
                            }
                            return { style, className: 'prism-line' };
                        }}
                    >
                        {file.content || '// Empty Data Stream'}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
}
