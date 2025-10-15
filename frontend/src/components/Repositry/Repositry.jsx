import React, { useEffect, useState, useMemo } from "react";
import './Repositry.css';

/**
 * Repositry.jsx
 * Modern GitHub-inspired repository listing component.
 *
 * Props:
 *  - username (string): GitHub username to display repositories for
 *  - onStats (function): Callback receiving { publicCount, totalStars, totalForks }
 *
 * Usage:
 *  <Repositry username="your-github-username" onStats={(stats) => console.log(stats)} />
 *
 * Features:
 *  - Beautiful card-based layout with hover effects
 *  - Search and sort functionality
 *  - Language badges with colors
 *  - Responsive design
 *  - Dark mode support
 *  - Smooth animations
 */

export default function Repositry({ username = "octocat", onStats }) {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("updated"); // "updated" | "stars" | "forks" | "name"
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        let mounted = true;
        const cacheKey = `repos:${username}`;
        async function load() {
            setLoading(true);
            setError(null);

            // Try cache first
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (mounted) setRepos(parsed);
                }
            } catch {
                // ignore cache errors
            }

            try {
                const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
                if (!res.ok) {
                    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
                }
                const data = await res.json();
                // basic normalization
                const normalized = data.map((r) => ({
                    id: r.id,
                    name: r.name,
                    full_name: r.full_name,
                    description: r.description,
                    html_url: r.html_url,
                    stargazers_count: r.stargazers_count,
                    forks_count: r.forks_count,
                    language: r.language,
                    updated_at: r.updated_at,
                }));
                if (mounted) {
                    setRepos(normalized);
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify(normalized));
                    } catch (err) {
                        // ignore localStorage errors (quota, private mode)
                        console.debug('localStorage setItem failed', err);
                    }
                    // report basic stats to parent if requested
                    try {
                        if (typeof onStats === 'function') {
                            const publicCount = normalized.length;
                            const totalStars = normalized.reduce((s, r) => s + (r.stargazers_count || 0), 0);
                            const totalForks = normalized.reduce((s, r) => s + (r.forks_count || 0), 0);
                            onStats({ publicCount, totalStars, totalForks });
                        }
                    } catch (err) {
                        // don't block UI on callback errors
                        console.debug('onStats callback failed', err);
                    }
                }
            } catch (err) {
                if (mounted) setError(err.message || "Failed to fetch repositories");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, [username, onStats]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = repos.slice();
        if (q) {
            list = list.filter(
                (r) =>
                    (r.name && r.name.toLowerCase().includes(q)) ||
                    (r.description && r.description.toLowerCase().includes(q)) ||
                    (r.language && r.language.toLowerCase().includes(q))
            );
        }
        switch (sortBy) {
            case "stars":
                list.sort((a, b) => b.stargazers_count - a.stargazers_count);
                break;
            case "forks":
                list.sort((a, b) => b.forks_count - a.forks_count);
                break;
            case "name":
                list.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "updated":
            default:
                list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }
        return list;
    }, [repos, query, sortBy]);

    const visible = filtered.slice(0, visibleCount);

    // Calculate stats for display
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    // Get language class name
    const getLanguageClass = (lang) => {
        if (!lang) return '';
        return `language-${lang.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    };

    return (
        <div className="repo-container">
            {/* Header */}
            <div className="repo-header">
                <h2 className="repo-title">
                    <span className="repo-title-icon">📚</span>
                    Repositories
                    <span className="repo-username">· {username}</span>
                </h2>
                <div className="repo-controls">
                    <input
                        className="repo-search-input"
                        type="text"
                        aria-label="Search repositories"
                        placeholder="Search repos..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <select
                        className="repo-sort-select"
                        aria-label="Sort repositories"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="updated">Recently updated</option>
                        <option value="stars">Most stars</option>
                        <option value="forks">Most forks</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Stats Bar */}
            {!loading && !error && repos.length > 0 && (
                <div className="repo-stats">
                    <div className="repo-stat-item">
                        <span className="repo-stat-icon">📦</span>
                        <div>
                            <div className="repo-stat-label">Repositories</div>
                            <div className="repo-stat-value">{repos.length}</div>
                        </div>
                    </div>
                    <div className="repo-stat-item">
                        <span className="repo-stat-icon">⭐</span>
                        <div>
                            <div className="repo-stat-label">Total Stars</div>
                            <div className="repo-stat-value">{totalStars}</div>
                        </div>
                    </div>
                    <div className="repo-stat-item">
                        <span className="repo-stat-icon">🍴</span>
                        <div>
                            <div className="repo-stat-label">Total Forks</div>
                            <div className="repo-stat-value">{totalForks}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="repo-loading">
                    <div className="repo-loading-spinner"></div>
                    <p>Loading repositories…</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="repo-error">
                    <span className="repo-error-icon">⚠️</span>
                    <p>Error: {error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filtered.length === 0 && (
                <div className="repo-empty">
                    <span className="repo-empty-icon">🔍</span>
                    <p>{query ? 'No repositories match your search.' : 'No repositories found.'}</p>
                </div>
            )}

            {/* Repository Grid */}
            {!loading && !error && filtered.length > 0 && (
                <div className="repo-list">
                    {visible.map((r) => (
                        <article key={r.id} className="repo-card">
                            {/* Card Header */}
                            <div className="repo-card-header">
                                <a 
                                    href={r.html_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="repo-name-link"
                                >
                                    <span className="repo-name-icon">📁</span>
                                    {r.name}
                                </a>
                            </div>

                            {/* Metadata */}
                            <div className="repo-meta">
                                {r.language && (
                                    <span className={`repo-language ${getLanguageClass(r.language)}`}>
                                        <span className="repo-language-dot"></span>
                                        {r.language}
                                    </span>
                                )}
                                <span className="repo-meta-item" title="Stars">
                                    <span className="repo-meta-icon">⭐</span>
                                    {r.stargazers_count}
                                </span>
                                <span className="repo-meta-item" title="Forks">
                                    <span className="repo-meta-icon">🍴</span>
                                    {r.forks_count}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="repo-description">
                                {r.description || (
                                    <span className="repo-description-empty">No description provided</span>
                                )}
                            </p>

                            {/* Card Footer */}
                            <div className="repo-card-footer">
                                <span className="repo-updated">
                                    🕒 {new Date(r.updated_at).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <a
                                    href={r.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="repo-link"
                                >
                                    View on GitHub →
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {!loading && !error && filtered.length > visibleCount && (
                <div className="repo-footer">
                    <button 
                        className="repo-load-more-btn" 
                        onClick={() => setVisibleCount((c) => c + 12)}
                    >
                        Load More Repositories
                    </button>
                </div>
            )}

            {/* Result Count */}
            {!loading && !error && filtered.length > 0 && (
                <div className="repo-footer">
                    <p className="repo-count">
                        Showing <span className="repo-count-highlight">{Math.min(visibleCount, filtered.length)}</span> of{' '}
                        <span className="repo-count-highlight">{filtered.length}</span> repositories
                    </p>
                </div>
            )}
        </div>
    );
}
