import React from 'react';
import { useReader } from '../context/ReaderContext';
import type { ArticleSection } from '@premium-reader/types';

// Design tokens
const tokens = {
    paper: '#F9F9F7',
    ink: '#1C1C1C',
    inkSecondary: '#4A4A4A',
    inkMuted: '#8A8A8A',
    border: 'rgba(0,0,0,0.06)',
    accent: '#D97706',
    fontDisplay: '"Playfair Display", Georgia, serif',
    fontUi: '"Inter", sans-serif',
};

interface TableOfContentsProps {
    title?: string;
    onSectionClick?: (section: ArticleSection) => void;
}

export function TableOfContents({ title, onSectionClick }: TableOfContentsProps) {
    const { structure, activeSection, scrollToSection, mode } = useReader();

    // Only show in scan mode
    if (mode !== 'scan') {
        return null;
    }

    const handleClick = (section: ArticleSection) => {
        scrollToSection(section);
        onSectionClick?.(section);
    };

    const SidebarContainerConsumer = ({ children }: { children: React.ReactNode }) => (
        <nav
            className="toc-sidebar"
            style={{
                position: 'fixed',
                left: '32px',
                top: '120px',
                width: '200px',
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
                padding: '16px 0',
                zIndex: 90,
            }}
        >
            {/* Guide label */}
            <div
                style={{
                    fontSize: '11px',
                    fontFamily: tokens.fontUi,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: tokens.inkMuted,
                    marginBottom: '16px',
                    paddingLeft: '12px',
                }}
            >
                Guide
            </div>
            {children}
        </nav>
    );

    // Loading skeleton
    if (!structure) {
        return (
            <SidebarContainerConsumer>
                <div style={{ padding: '0 12px' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ marginBottom: '16px' }}>
                            <div
                                style={{
                                    height: '14px',
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                    borderRadius: '4px',
                                    width: `${Math.random() * 40 + 60}%`,
                                    marginBottom: '6px',
                                    animation: 'pulse 1.5s infinite ease-in-out',
                                }}
                            />
                            <div
                                style={{
                                    height: '10px',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    borderRadius: '3px',
                                    width: `${Math.random() * 30 + 40}%`,
                                }}
                            />
                        </div>
                    ))}
                    <style>{`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 0.3; }
              100% { opacity: 0.6; }
            }
          `}</style>
                </div>
            </SidebarContainerConsumer>
        );
    }

    // Loaded content
    return (
        <SidebarContainerConsumer>
            <ul
                style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                }}
            >
                {structure.sections.map((section) => {
                    const isActive = activeSection === section.id;
                    const isSubsection = section.level === 2;

                    return (
                        <li
                            key={section.id}
                            style={{
                                marginBottom: '4px',
                            }}
                        >
                            <button
                                onClick={() => handleClick(section)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: isSubsection ? '8px 12px 8px 24px' : '8px 12px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontFamily: tokens.fontUi,
                                    fontSize: isSubsection ? '12px' : '13px',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? tokens.ink : tokens.inkSecondary,
                                    lineHeight: 1.4,
                                    transition: 'all 0.15s ease',
                                    position: 'relative',
                                    display: 'block',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '16px',
                                            backgroundColor: tokens.ink,
                                            borderRadius: '2px',
                                        }}
                                    />
                                )}
                                {section.title}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* TL;DR summary if available */}
            {structure.tldr && (
                <div
                    style={{
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: `1px solid ${tokens.border}`,
                        paddingLeft: '12px',
                        paddingRight: '12px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '10px',
                            fontFamily: tokens.fontUi,
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: tokens.inkMuted,
                            marginBottom: '8px',
                        }}
                    >
                        TL;DR
                    </div>
                    <p
                        style={{
                            fontSize: '12px',
                            fontFamily: tokens.fontUi,
                            color: tokens.inkSecondary,
                            lineHeight: 1.5,
                            margin: 0,
                        }}
                    >
                        {structure.tldr}
                    </p>
                </div>
            )}
        </SidebarContainerConsumer>
    );
}
