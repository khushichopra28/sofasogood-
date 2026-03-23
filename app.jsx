const { useState, useEffect, useRef, useCallback } = React;

const CATALOG = [
    { id: 'sofa', label: 'sofa', emoji: '🛋️', w: 160, h: 65, color: '#8B7D4A', h3d: 0.85 },
    { id: 'cupboard', label: 'cupboard', emoji: '🗄️', w: 80, h: 120, color: '#6B5B3A', h3d: 1.9 },
    { id: 'wardrobe', label: 'wardrobe', emoji: '🚪', w: 100, h: 130, color: '#5C4A2E', h3d: 1.9 },
    { id: 'bed', label: 'bed', emoji: '🛏️', w: 150, h: 110, color: '#C4884A', h3d: 0.55 },
    { id: 'desk', label: 'desk', emoji: '🖥️', w: 120, h: 60, color: '#D4C68E', h3d: 0.52 },
    { id: 'bookshelf', label: 'bookshelf', emoji: '📚', w: 70, h: 120, color: '#7A6438', h3d: 1.9 },
    { id: 'tv_unit', label: 'tv unit', emoji: '📺', w: 140, h: 50, color: '#3A3020', h3d: 0.52 },
    { id: 'armchair', label: 'armchair', emoji: '💺', w: 80, h: 75, color: '#C9A84C', h3d: 0.85 },
    { id: 'plant', label: 'plant', emoji: '🌿', w: 50, h: 65, color: '#5A8A3A', h3d: 1.0 },
    { id: 'lamp', label: 'lamp', emoji: '💡', w: 45, h: 110, color: '#F5F0E8', h3d: 1.65 },
    { id: 'rug', label: 'rug', emoji: '🟫', w: 160, h: 90, color: '#8B6B2A', h3d: 0.05 },
    { id: 'dining', label: 'dining', emoji: '🍽️', w: 130, h: 85, color: '#6B4420', h3d: 0.52 },
    { id: 'coffee', label: 'coffee', emoji: '☕', w: 100, h: 55, color: '#9A8C6A', h3d: 0.52 },
    { id: 'sideboard', label: 'sideboard', emoji: '🪵', w: 130, h: 55, color: '#5A4A2E', h3d: 0.52 }
];

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Home Office', 'Dining Room'];
const SWATCHES = ['#D4C68E', '#F5F0E8', '#C4884A', '#8B7D4A', '#C9A84C', '#5A8A3A', '#6B4420', '#3A3020', '#8B6B2A', '#5C4A2E', '#9A8C6A', '#C45A3A', '#7A6438', '#5A4A2E'];

// Math Helpers for 3D
function normalize(v) {
    const mag = Math.hypot(v.x, v.y, v.z);
    return mag === 0 ? { x: 0, y: 0, z: 0 } : { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

// ===== PIXEL HEART COMPONENT =====
function PixelHeart({ size = 12, color = '#C45A3A' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 8 7" style={{ imageRendering: 'pixelated' }}>
            <rect x="1" y="0" width="1" height="1" fill={color} />
            <rect x="2" y="0" width="1" height="1" fill={color} />
            <rect x="4" y="0" width="1" height="1" fill={color} />
            <rect x="5" y="0" width="1" height="1" fill={color} />
            <rect x="0" y="1" width="1" height="1" fill={color} />
            <rect x="1" y="1" width="1" height="1" fill={color} />
            <rect x="2" y="1" width="1" height="1" fill={color} />
            <rect x="3" y="1" width="1" height="1" fill={color} />
            <rect x="4" y="1" width="1" height="1" fill={color} />
            <rect x="5" y="1" width="1" height="1" fill={color} />
            <rect x="6" y="1" width="1" height="1" fill={color} />
            <rect x="0" y="2" width="7" height="1" fill={color} />
            <rect x="1" y="3" width="5" height="1" fill={color} />
            <rect x="2" y="4" width="3" height="1" fill={color} />
            <rect x="3" y="5" width="1" height="1" fill={color} />
        </svg>
    );
}

// ===== PIXEL SWORD ICON =====
function PixelSword({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
            <rect x="6" y="0" width="1" height="1" fill="#9A8C6A" />
            <rect x="5" y="1" width="1" height="1" fill="#D4C68E" />
            <rect x="7" y="1" width="1" height="1" fill="#9A8C6A" />
            <rect x="4" y="2" width="1" height="1" fill="#D4C68E" />
            <rect x="6" y="2" width="1" height="1" fill="#9A8C6A" />
            <rect x="3" y="3" width="1" height="1" fill="#D4C68E" />
            <rect x="1" y="4" width="1" height="1" fill="#6B4420" />
            <rect x="2" y="4" width="1" height="1" fill="#C4884A" />
            <rect x="0" y="5" width="1" height="1" fill="#6B4420" />
            <rect x="1" y="5" width="1" height="1" fill="#C4884A" />
            <rect x="2" y="5" width="1" height="1" fill="#6B4420" />
            <rect x="0" y="6" width="1" height="1" fill="#6B4420" />
        </svg>
    );
}

// ===== PIXEL BLOCK PROGRESS BAR =====
function PixelProgressBlocks({ pct, total = 20 }) {
    const filled = Math.round((pct / 100) * total);
    return (
        <div style={{ display: 'flex', gap: '2px', marginTop: 12 }}>
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{
                    width: '100%',
                    height: 12,
                    background: i < filled
                        ? (i % 2 === 0 ? '#C4884A' : '#C9A84C')
                        : 'var(--dim)',
                    border: '1px solid rgba(0,0,0,0.3)',
                    transition: 'background 0.1s',
                    boxShadow: i < filled
                        ? 'inset 1px 1px 0px rgba(255,255,255,0.2)'
                        : 'inset 1px 1px 0px rgba(0,0,0,0.2)'
                }} />
            ))}
        </div>
    );
}

// ===== FLOATING FURNITURE SYSTEM (Blast Animation) =====
function FloatingFurniture() {
    const canvasRef = useRef(null);
    const furnitureRef = useRef([]);
    const mouseRef = useRef({ x: -2000, y: -2000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const emojis = ['🛋️', '💺', '🛏️', '🗄️', '🚪', '🌿', '🪵'];
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (furnitureRef.current.length === 0) {
              furnitureRef.current = Array.from({ length: 22 }).map(() => ({
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  vx: (Math.random() - 0.5) * 1.5,
                  vy: (Math.random() - 0.5) * 1.5,
                  emoji: emojis[Math.floor(Math.random() * emojis.length)],
                  rotation: Math.random() * Math.PI * 2,
                  rv: (Math.random() - 0.5) * 0.02,
                  size: 50 + Math.random() * 50
              }));
            }
        };
        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseDown = (e) => {
            const mx = e.clientX;
            const my = e.clientY;
            furnitureRef.current.forEach(f => {
                const dx = f.x - mx;
                const dy = f.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 350) {
                    const power = (350 - dist) / 350;
                    f.vx += (dx / (dist || 1)) * power * 35;
                    f.vy += (dy / (dist || 1)) * power * 35;
                    f.rv += (Math.random() - 0.5) * 0.4;
                }
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            furnitureRef.current.forEach(f => {
                f.x += f.vx;
                f.y += f.vy;
                f.rotation += f.rv;

                if (f.x < -150) f.x = canvas.width + 150;
                if (f.x > canvas.width + 150) f.x = -150;
                if (f.y < -150) f.y = canvas.height + 150;
                if (f.y > canvas.height + 150) f.y = -150;

                const dx = f.x - mouseRef.current.x;
                const dy = f.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180) {
                    const force = (180 - dist) / 180;
                    f.vx += (dx / (dist || 1)) * force * 3;
                    f.vy += (dy / (dist || 1)) * force * 3;
                }

                f.vx *= 0.96;
                f.vy *= 0.96;
                f.rv *= 0.98;
                f.vx += (Math.random() - 0.5) * 0.1;
                f.vy += (Math.random() - 0.5) * 0.1;

                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.rotation);
                ctx.font = `${f.size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // User asked for solid opacity
                ctx.globalAlpha = 1.0;
                ctx.fillText(f.emoji, 0, 0);
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ 
      position: 'fixed', top: 0, left: 0, 
      width: '100%', height: '100%', 
      pointerEvents: 'none', zIndex: 0 
    }} />;
}

// ===== STAGE 1: UPLOAD / ROOM SELECT =====
function Stage1({ onNext }) {
    const [photo, setPhoto] = useState(null);
    const [rt, setRt] = useState('');

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const r = new FileReader();
        r.onload = e => setPhoto(e.target.result);
        r.readAsDataURL(file);
    };

    return (
        <div className="flex center fh fw fi">
            <div style={{
                maxWidth: 540, width: '100%', padding: '32px',
                background: 'var(--surface)',
                border: '3px solid',
                borderColor: '#C8B898 #A89878 #A89878 #C8B898',
                boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.6), inset -2px -2px 0px rgba(0,0,0,0.08), 6px 6px 0px rgba(0,0,0,0.15)',
                textAlign: 'center'
            }}>
                {/* Pixel Title */}
                <h1 className="wm" style={{ marginBottom: 4 }}>SOFA, SO GOOD!</h1>
                <p style={{
                    color: 'var(--copper)', letterSpacing: '1px', fontSize: '8px',
                    textTransform: 'uppercase', marginBottom: '24px'
                }}>
                    Play. Design. Visualize.
                </p>

                {!photo ? (
                    <div className="dz" onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }} onDragOver={e => e.preventDefault()}>
                        <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏠</div>
                        <p style={{ fontSize: '7px', color: 'var(--muted)', lineHeight: '2' }}>
                            Drop room photo here<br />or click to browse
                        </p>
                    </div>
                ) : (
                    <div className="rel" style={{
                        width: '100%', height: '180px', overflow: 'hidden',
                        border: '3px solid var(--dim)',
                        boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.3)'
                    }}>
                        <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'auto' }} />
                        <button className="abs" style={{
                            top: 6, right: 6, background: 'rgba(0,0,0,0.7)',
                            color: 'var(--text)', padding: '4px 8px', fontSize: '7px',
                            border: '2px solid var(--dim)', cursor: 'pointer'
                        }} onClick={() => setPhoto(null)}>✕</button>
                    </div>
                )}

                <div style={{
                    margin: '24px 0 12px', fontSize: '7px', color: 'var(--muted)',
                    textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                    ▸ Select Biome
                </div>
                <div className="flex" style={{ gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>
                    {ROOM_TYPES.map(t => (
                        <div key={t} className={`chip ${rt === t ? 'act' : ''}`} onClick={() => setRt(t)}>{t}</div>
                    ))}
                </div>

                <button className="btn bg fw" style={{ padding: '12px', fontSize: '8px' }} disabled={!rt} onClick={() => onNext({ photo, rt })}>
                    ⛏️ Analyze Room →
                </button>
            </div>
        </div>
    );
}

// ===== STAGE 2: AI ANALYSIS =====
function Stage2({ data, onNext }) {
    const [pct, setPct] = useState(0);
    const [lbl, setLbl] = useState("Initializing pixel scan...");
    const [findings, setFindings] = useState([]);

    useEffect(() => {
        let p = 0;
        const i = setInterval(() => {
            p += Math.random() * 8 + 2;
            if (p > 100) p = 100;
            setPct(p);
            if (p >= 28 && p < 58) setLbl("Mining spatial data...");
            else if (p >= 58 && p < 88) setLbl("Crafting furniture matches...");
            else if (p >= 88 && p < 100) setLbl("Enchanting design hints...");

            if (p >= 100) {
                clearInterval(i);
                setTimeout(() => onNext({
                    obs: ["High ceiling detected — great for vertical builds!", "Spacious center area — perfect for a focal rug block.", "Warm ambient lighting — earthy tones recommended."],
                    sugs: [{ id: 'sofa', reason: 'Anchors the room core' }, { id: 'rug', reason: 'Defines the center zone' }, { id: 'plant', reason: 'Adds organic life blocks' }]
                }), 700);
            }
        }, 200);

        const to1 = setTimeout(() => setFindings(f => [...f, "Biome: " + data.rt]), 600);
        const to2 = setTimeout(() => setFindings(f => [...f, "Light Level: Warm ☀️"]), 1400);
        const to3 = setTimeout(() => setFindings(f => [...f, "Style: Modern Pixel 🎮"]), 2200);

        return () => { clearInterval(i); clearTimeout(to1); clearTimeout(to2); clearTimeout(to3); };
    }, [data, onNext]);

    return (
        <div className="flex center fh fw rel fi">
            {data.photo && <img src={data.photo} className="abs fw fh" style={{ objectFit: 'cover', filter: 'brightness(0.4) blur(6px)', zIndex: 0, imageRendering: 'auto' }} />}
            <div className="col rel" style={{
                zIndex: 1, width: 420,
                background: 'rgba(245,240,232,0.95)',
                padding: 32,
                border: '3px solid',
                borderColor: '#C8B898 #A89878 #A89878 #C8B898',
                boxShadow: '6px 6px 0px rgba(0,0,0,0.15)'
            }}>
                <div className="flex center" style={{ gap: 8, marginBottom: 4 }}>
                    <PixelSword size={16} />
                    <h2 style={{ fontSize: 12, color: 'var(--copper)' }}>AI Analysis</h2>
                    <PixelSword size={16} />
                </div>
                <div style={{ fontSize: 7, color: 'var(--muted)', marginBottom: 16, textAlign: 'center' }}>{lbl}</div>

                <PixelProgressBlocks pct={pct} />

                <div style={{ fontSize: 7, color: 'var(--dim)', textAlign: 'right', marginTop: 4 }}>{Math.round(pct)}%</div>

                <div className="col" style={{ marginTop: 20, gap: 10 }}>
                    {findings.map((f, i) => (
                        <div key={i} className="flex fi" style={{ alignItems: 'center', gap: 8, fontSize: 8 }}>
                            <div style={{
                                width: 8, height: 8,
                                background: 'var(--copper)',
                                border: '1px solid #6B4420',
                                flexShrink: 0
                            }}></div>
                            {f}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ===== STAGE 3: DESIGN CANVAS =====
function Stage3({ data, nextStage }) {
    const [items, setItems] = useState([]);
    const [sel, setSel] = useState(null);
    const [tab, setTab] = useState('items');
    const [hints, setHints] = useState(true);
    const [toast, setToast] = useState('');
    const wrapRef = useRef();

    const addItem = (catItem) => {
        const w = wrapRef.current ? wrapRef.current.clientWidth : 800;
        const h = wrapRef.current ? wrapRef.current.clientHeight : 600;
        const it = {
            uid: Math.random().toString(36).substr(2, 9),
            ...catItem,
            x: w / 2 - catItem.w / 2 + (Math.random() * 40 - 20),
            y: h / 2 - catItem.h / 2 + (Math.random() * 40 - 20),
        };
        setItems(prev => [...prev, it]);
        setSel(it.uid);
    };

    const delItem = (uid) => { setItems(prev => prev.filter(i => i.uid !== uid)); if (sel === uid) setSel(null); };
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const [drag, setDrag] = useState(null);

    useEffect(() => {
        const move = (e) => {
            if (!drag) return;
            if (drag.type === 'move') {
                setItems(prev => prev.map(i => {
                    if (i.uid !== drag.uid) return i;
                    let nx = drag.initX + (e.clientX - drag.startX);
                    let ny = drag.initY + (e.clientY - drag.startY);
                    return { ...i, x: nx, y: ny };
                }));
            } else if (drag.type === 'resize') {
                setItems(prev => prev.map(i => {
                    if (i.uid !== drag.uid) return i;
                    let nw = Math.max(40, drag.initW + (e.clientX - drag.startX));
                    let nh = Math.max(30, drag.initH + (e.clientY - drag.startY));
                    return { ...i, w: nw, h: nh };
                }));
            }
        };
        const up = () => setDrag(null);
        if (drag) {
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
        }
        return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    }, [drag]);

    const [layoutImg, setLayoutImg] = useState(null);

    const generateLayoutImage = useCallback(() => {
      if (!wrapRef.current || items.length === 0) {
        showToast('Place furniture blocks first ⛏️');
        return;
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const rect = wrapRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      // Draw background photo if available
      if (data.photo) {
        const bg = new Image();
        bg.crossOrigin = 'anonymous';
        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
          // Draw furniture
          items.forEach(it => {
            ctx.fillStyle = it.color;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillRect(it.x, it.y, it.w, it.h);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.font = `${Math.min(it.w, it.h) * 0.6}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(it.emoji, it.x + it.w/2, it.y + it.h/2);
          });
          setLayoutImg(canvas.toDataURL('image/png'));
          showToast('Layout image ready for AI 🎨');
        };
        bg.src = data.photo;
      } else {
        ctx.fillStyle = '#2a2318';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ... draw furniture as above
        items.forEach(it => {
          ctx.fillStyle = it.color;
          ctx.fillRect(it.x, it.y, it.w, it.h);
          ctx.font = `${Math.min(it.w, it.h) * 0.6}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(it.emoji, it.x + it.w/2, it.y + it.h/2);
        });
        setLayoutImg(canvas.toDataURL('image/png'));
        showToast('Layout image ready for AI 🎨');
      }
    }, [items, data.photo]);

    const curItem = items.find(i => i.uid === sel);


    return (
        <div className="flex col fw fh fi">
            {toast && <div className="toast">{toast}</div>}
            <div className="tbar">
                <div className="flex center" style={{ gap: 12 }}>
                    <div className="wm" style={{ fontSize: 11 }}>SOFA, SO GOOD!</div>
                    <div className="flex" style={{ gap: 3 }}>
                        {[1, 2, 3, 4].map(s => <div key={s} style={{
                            width: s === 3 ? 16 : 8, height: 8,
                            background: s < 4 ? 'var(--copper)' : 'var(--dim)',
                            transition: 'all 0.2s',
                            border: '1px solid rgba(0,0,0,0.3)'
                        }} />)}
                    </div>
                </div>
                <div className="flex center" style={{ gap: 8 }}>
                    <button className="btn bgo" style={{ fontSize: 7 }} onClick={() => setHints(!hints)}>
                        {hints ? '👁️ Hide Hints' : '👁️ Show Hints'}
                    </button>
                    <button className="btn bg" style={{ fontSize: 7 }} onClick={() => nextStage({ items })}>
                        3D Preview →
                    </button>
                </div>
            </div>

            <div className="flex" style={{ flex: 1, minHeight: 0 }}>
                <div className="cv-wrap craft-bg" ref={wrapRef} onMouseDown={(e) => { if (e.target === wrapRef.current || e.target.classList.contains('cv-grid')) setSel(null); }}>
                    {data.photo
                        ? <img src={data.photo} className="cv-bg" />
                        : <div className="cv-bg" style={{ background: 'linear-gradient(to bottom, #EDE8DE, #F5F0E8)', opacity: 1 }} />
                    }
                    <div className="cv-grid"></div>

                    {/* Ghost hints */}
                    {hints && data.sugs.slice(0, 2).map((s, i) => {
                        const cat = CATALOG.find(c => c.id === s.id);
                        if (!cat) return null;
                        return (
                            <div key={i} className="ghost" style={{ left: 200 + i * 200, top: 200 + i * 100, width: cat.w, height: cat.h }}>
                                <div className="ghost-lbl">AI: {cat.label}</div>
                            </div>
                        );
                    })}

                    {/* Furniture Items */}
                    {items.map(it => (
                        <div key={it.uid} className={`f-item ${sel === it.uid ? 'sel' : ''}`}
                            style={{ left: it.x, top: it.y, width: it.w, height: it.h, '--item-col': it.color }}
                            onMouseDown={(e) => { setSel(it.uid); setTab('props'); setDrag({ type: 'move', uid: it.uid, startX: e.clientX, startY: e.clientY, initX: it.x, initY: it.y }); }}>
                            {it.emoji}
                            {sel === it.uid && <div className="f-lbl">{it.label}</div>}
                            {sel === it.uid && <div className="del-btn" onMouseDown={(e) => { e.stopPropagation(); delItem(it.uid); }}>✕</div>}
                            {sel === it.uid && <div className="rh" onMouseDown={(e) => { e.stopPropagation(); setDrag({ type: 'resize', uid: it.uid, startX: e.clientX, startY: e.clientY, initW: it.w, initH: it.h }); }} />}
                        </div>
                    ))}

                    <div className="btbar">
                        <button className="btn bgo" style={{ fontSize: 7 }} onClick={() => setItems([])}>Clear</button>
                        <button className="btn bgo" style={{ fontSize: 7 }} disabled={!sel} onClick={() => delItem(sel)}>Del</button>
                        <button className="btn bgo" style={{ fontSize: 7 }} onClick={() => showToast('⛏️ Drag items. Resize with corner block.')}>?</button>
                    </div>
                </div>

                {/* SIDEBAR — INVENTORY */}
                <div className="sb">
                    <div className="flex" style={{ borderBottom: '3px solid var(--dim)' }}>
                        {['items', 'ideas', 'props'].map(t => (
                            <div key={t} style={{
                                flex: 1, padding: '10px 0', textAlign: 'center',
                                fontSize: 7, textTransform: 'uppercase', cursor: 'pointer',
                                borderBottom: tab === t ? '3px solid var(--copper)' : '3px solid transparent',
                                color: tab === t ? 'var(--copper)' : 'var(--muted)',
                                fontWeight: 400, background: tab === t ? 'rgba(196,136,74,0.05)' : 'transparent'
                            }} onClick={() => setTab(t)}>
                                {t === 'items' ? '📦 ' : t === 'ideas' ? '💡 ' : '🔧 '}{t}
                            </div>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        {tab === 'items' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {CATALOG.map(c => {
                                    const added = items.some(i => i.id === c.id);
                                    return (
                                        <div key={c.id} onClick={() => addItem(c)} style={{
                                            background: 'var(--card)',
                                            border: '3px solid',
                                            borderColor: '#5A4A2E #3A2E1A #3A2E1A #5A4A2E',
                                            padding: '12px 6px',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', gap: 6, cursor: 'pointer',
                                            transition: 'all 0.1s', position: 'relative',
                                            boxShadow: '2px 2px 0px rgba(0,0,0,0.4)'
                                        }}>
                                            <div style={{ fontSize: 28 }}>{c.emoji}</div>
                                            <div style={{ fontSize: 6, textTransform: 'uppercase', color: 'var(--muted)' }}>{c.label}</div>
                                            {added && <div className="abs" style={{ top: 3, right: 3, color: 'var(--green)', fontSize: 7 }}>✓</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {tab === 'ideas' && (
                            <div className="col" style={{ gap: 12 }}>
                                <div style={{
                                    paddingLeft: 10, borderLeft: '3px solid var(--copper)',
                                    fontSize: 8, color: 'var(--text)', marginBottom: 12
                                }}>
                                    {data.obs.map((o, i) => <p key={i} style={{ marginBottom: 6, lineHeight: '2' }}>▸ {o}</p>)}
                                </div>
                                {data.sugs.map((s, i) => {
                                    const c = CATALOG.find(cat => cat.id === s.id);
                                    if (!c) return null;
                                    return (
                                        <div key={i} style={{
                                            padding: 12, background: 'var(--card)',
                                            border: '3px solid',
                                            borderColor: '#5A4A2E #3A2E1A #3A2E1A #5A4A2E',
                                            boxShadow: '2px 2px 0px rgba(0,0,0,0.4)'
                                        }}>
                                            <div className="flex center" style={{ justifyContent: 'flex-start', gap: 10, marginBottom: 6 }}>
                                                <span style={{ fontSize: 20 }}>{c.emoji}</span>
                                                <span style={{ fontSize: 8, textTransform: 'uppercase', color: 'var(--copper)' }}>{c.label}</span>
                                            </div>
                                            <p style={{ fontSize: 7, color: 'var(--muted)', marginBottom: 12, lineHeight: '2' }}>{s.reason}</p>
                                            <button className="btn bgh fw" style={{ padding: 6, fontSize: 7 }} onClick={() => { addItem(c); showToast(`⛏️ ${c.label} placed!`); }}>+ Craft</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {tab === 'props' && (
                            <div>
                                {!curItem ? <div style={{ fontSize: 7, color: 'var(--muted)', textAlign: 'center', marginTop: 32, lineHeight: '2.5' }}>Select a block<br />to edit properties</div> : (
                                    <div className="col fi" style={{ gap: 18 }}>
                                        <div className="flex center" style={{ fontSize: 36 }}>{curItem.emoji}</div>
                                        <div>
                                            <div className="flex" style={{ justifyContent: 'space-between', fontSize: 7, color: 'var(--muted)', marginBottom: 6 }}><span>Width</span> <span>{Math.round(curItem.w)}px</span></div>
                                            <input type="range" min="40" max="280" value={curItem.w} onChange={e => setItems(prev => prev.map(i => i.uid === sel ? { ...i, w: parseInt(e.target.value) } : i))} />
                                        </div>
                                        <div>
                                            <div className="flex" style={{ justifyContent: 'space-between', fontSize: 7, color: 'var(--muted)', marginBottom: 6 }}><span>Height</span> <span>{Math.round(curItem.h)}px</span></div>
                                            <input type="range" min="30" max="200" value={curItem.h} onChange={e => setItems(prev => prev.map(i => i.uid === sel ? { ...i, h: parseInt(e.target.value) } : i))} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 7, color: 'var(--muted)', marginBottom: 8 }}>Block Color</div>
                                            <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                                                {SWATCHES.map(sw => (
                                                    <div key={sw} className={`swatch ${curItem.color === sw ? 'sel' : ''}`} style={{ background: sw }} onClick={() => setItems(prev => prev.map(i => i.uid === sel ? { ...i, color: sw } : i))} />
                                                ))}
                                            </div>
                                        </div>
                                        <button className="btn" style={{ background: 'var(--red)', color: '#fff', marginTop: 12, padding: '10px', fontSize: 7, border: '3px solid #8B3020' }} onClick={() => delItem(sel)}>🗑️ Destroy Block</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="col" style={{ padding: 16, borderTop: '3px solid var(--dim)', background: 'var(--card)' }}>
                        <div style={{ fontSize: 7, color: 'var(--muted)', marginBottom: 10, textAlign: 'center' }}>📦 Blocks placed: {items.length}</div>
                        <button className="btn bg fw" style={{ fontSize: 7, padding: 10 }} onClick={() => nextStage({ items })}>Preview 3D →</button>
                        {layoutImg && <img src={layoutImg} style={{width: '100%', height: 80, objectFit: 'cover', border: '2px solid var(--copper)', marginBottom: 8}} alt="Layout Preview" />}
                        <button className="btn bgo fw" style={{ fontSize: 7 }} onClick={generateLayoutImage} disabled={!data.photo && items.length === 0}>📸 Generate Layout Image</button>
                        <button className="btn bgo fw" style={{ marginTop: 6, border: 'none', fontSize: 7 }} onClick={() => nextStage({ items, layoutImg, skip3D: true })}>Skip to Render</button>

                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== STAGE 4A: 3D PREVIEW =====
function Stage4a({ data, nextStage, onBack, isPreviewMode }) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const lightsRef = useRef({});
    const [lights, setLights] = useState({ ambient: true, daylight: false, warm: true });

    useEffect(() => {
        if (!mountRef.current || !window.THREE) return;

        const W = mountRef.current.clientWidth || window.innerWidth;
        const H = mountRef.current.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color('#EDE8DE');

        const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
        camera.position.set(0, 5, 9);

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mountRef.current.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

        let controls = null;
        const OC = THREE.OrbitControls || window.OrbitControls;
        if (OC) {
            controls = new OC(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.maxPolarAngle = Math.PI / 2 - 0.05;
        }

        // Lighting
        const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x443322, 0.4);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);
        lightsRef.current.ambient = hemiLight;

        const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.5);
        dirLight.position.set(5, 8, -5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 25;
        dirLight.shadow.camera.left = -10; dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10; dirLight.shadow.camera.bottom = -10;
        dirLight.shadow.bias = -0.0005;
        scene.add(dirLight);
        lightsRef.current.daylight = dirLight;

        const pointLight = new THREE.PointLight(0xffab5e, 2, 20);
        pointLight.position.set(0, 3.5, 0);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        pointLight.shadow.bias = -0.001;
        scene.add(pointLight);
        lightsRef.current.warm = pointLight;

        const RM_W = 12, RM_D = 10, RM_H = 4;

        // Floor
        const floorGeo = new THREE.PlaneGeometry(RM_W, RM_D);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xc4966a, roughness: 0.8 });
        const texLoader = new THREE.TextureLoader();
        const loadTex = (url) => texLoader.load(url,
            (tex) => {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(4, 4);
                if (url.includes('diffuse')) tex.encoding = THREE.sRGBEncoding;
            },
            undefined,
            () => console.warn("Texture fallback:", url)
        );

        const diffTex = loadTex('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
        const bumpTex = loadTex('https://threejs.org/examples/textures/hardwood2_bump.jpg');
        const roughTex = loadTex('https://threejs.org/examples/textures/hardwood2_roughness.jpg');

        floorMat.map = diffTex;
        floorMat.bumpMap = bumpTex;
        floorMat.bumpScale = 0.02;
        floorMat.roughnessMap = roughTex;

        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        const handleResize = () => {
            const w = mountRef.current.clientWidth || W;
            const h = mountRef.current.clientHeight || H;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };

        const ro = new ResizeObserver(handleResize);
        ro.observe(mountRef.current);
        handleResize();

        const wallMat = new THREE.MeshStandardMaterial({ color: 0xeae6df });
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(RM_W, RM_H), wallMat);
        backWall.position.set(0, RM_H / 2, -RM_D / 2);
        backWall.receiveShadow = true;
        scene.add(backWall);

        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(RM_D, RM_H), wallMat);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-RM_W / 2, RM_H / 2, 0);
        leftWall.receiveShadow = true;
        scene.add(leftWall);

        const GL = THREE.GLTFLoader || window.GLTFLoader;
        const loader = GL ? new GL() : null;
        const MODEL_URLS = {
            sofa: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/sofa/model.gltf',
            desk: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/desk/model.gltf',
            chair: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/chair-wood/model.gltf',
            armchair: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/chair-wood/model.gltf',
            plant: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf',
            lamp: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/lamp/model.gltf',
            bed: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bed/model.gltf',
            dining: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/table-wood/model.gltf',
            tv_unit: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf'
        };

        const W2D = 800, H2D = 600;

        data.items.forEach(it => {
            const cx = (it.x + it.w / 2) / W2D * RM_W - RM_W / 2;
            const cz = (it.y + it.h / 2) / H2D * RM_D - RM_D / 2;
            const targetW = (it.w / W2D) * RM_W;
            const targetD = (it.h / H2D) * RM_D;

            const url = MODEL_URLS[it.id];

            if (url && loader) {
                loader.load(url, (gltf) => {
                    const model = gltf.scene;
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const scaleX = targetW / size.x;
                    const scaleZ = targetD / size.z;
                    const scale = Math.min(scaleX, scaleZ) * 0.9;
                    model.scale.set(scale, scale, scale);
                    model.position.set(cx, 0, cz);
                    model.traverse((node) => {
                        if (node.isMesh) {
                            node.castShadow = true; node.receiveShadow = true;
                        }
                    });
                    scene.add(model);
                });
            } else {
                const h = it.h3d || 0.8;
                const geo = new THREE.BoxGeometry(targetW, h, targetD);
                const mat = new THREE.MeshStandardMaterial({ color: it.color, roughness: 0.6 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(cx, h / 2, cz);
                mesh.castShadow = true; mesh.receiveShadow = true;
                scene.add(mesh);
            }
        });

        const vigPlane = new THREE.PlaneGeometry(20, 20);
        const vigCnv = document.createElement('canvas');
        vigCnv.width = 512; vigCnv.height = 512;
        const vCtx = vigCnv.getContext('2d');
        const grad = vCtx.createRadialGradient(256, 256, 100, 256, 256, 350);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.8)');
        vCtx.fillStyle = grad; vCtx.fillRect(0, 0, 512, 512);
        const vigTex = new THREE.CanvasTexture(vigCnv);
        const vigMat = new THREE.MeshBasicMaterial({ map: vigTex, transparent: true, depthWrite: false });
        const vig = new THREE.Mesh(vigPlane, vigMat);
        vig.position.z = -1;
        camera.add(vig);
        scene.add(camera);

        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (controls) controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameId);
            ro.disconnect();
            if (mountRef.current && renderer.domElement.parentNode === mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [data.items]);

    useEffect(() => {
        if (!lightsRef.current) return;
        if (lightsRef.current.ambient) lightsRef.current.ambient.intensity = lights.ambient ? 0.6 : 0.1;
        if (lightsRef.current.daylight) lightsRef.current.daylight.intensity = lights.daylight ? 0.8 : 0;
        if (lightsRef.current.warm) lightsRef.current.warm.intensity = lights.warm ? 1 : 0;
    }, [lights]);


    return (
        <div className="flex fw fh fi" style={{ background: 'var(--bg)' }}>
            <div className="flex-1 rel" ref={mountRef} style={{ cursor: 'grab', overflow: 'hidden', position: 'relative', height: '100%' }}>
                <div className="abs" style={{ top: 16, left: 16, zIndex: 10 }}>
                    <h2 style={{ fontSize: 12, textShadow: '2px 2px 0px rgba(0,0,0,0.8)', color: 'var(--copper)' }}>⛏️ 3D Preview</h2>
                    <p style={{ fontSize: 7, color: 'var(--text)', textShadow: '1px 1px 0px rgba(0,0,0,0.8)', marginTop: 4 }}>Drag to orbit • Scroll to zoom</p>
                    {!isPreviewMode && (
                        <>
                            <button className="btn bgo" style={{ marginTop: 10, background: 'rgba(0,0,0,0.6)', fontSize: 7 }} onClick={onBack}>← Back</button>
                        </>
                    )}
                </div>
            </div>
            {!isPreviewMode && (
                <div className="sb" style={{ padding: 20, gap: 20 }}>
                    <div>
                        <div style={{ fontSize: 7, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>🔆 Lighting</div>
                        {['ambient', 'daylight', 'warm'].map(l => (
                            <div key={l} className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <span style={{ fontSize: 8, textTransform: 'capitalize' }}>{l}</span>
                                <div style={{
                                    width: 36, height: 18,
                                    background: lights[l] ? 'var(--copper)' : 'var(--dim)',
                                    position: 'relative', cursor: 'pointer',
                                    transition: '0.1s',
                                    border: '2px solid rgba(0,0,0,0.3)',
                                    boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.2)'
                                }} onClick={() => setLights(p => ({ ...p, [l]: !p[l] }))}>
                                    <div style={{
                                        position: 'absolute', top: 1,
                                        left: lights[l] ? 18 : 1,
                                        width: 14, height: 14,
                                        background: 'var(--cream)',
                                        transition: '0.1s',
                                        border: '1px solid rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1 }} />
                    <button className="btn bg fw" style={{ padding: 14, fontSize: 8 }} onClick={() => nextStage()}>✦ Final Render</button>
                </div>
            )}
        </div>
    );
}

// ===== STAGE 4B: FINAL RENDER =====
function Stage4b({ data, reset }) {
    const [load, setLoad] = useState(true);
    const [desc, setDesc] = useState(null);
    const [view3d, setView3d] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setDesc({
                text: `A cozy ${data.rt} crafted in warm, earthy pixel-style aesthetics. The space is anchored by carefully placed furnishing blocks that maximize flow and visual depth. Warm copper lighting and rich golden tones create an inviting, game-world atmosphere.`,
                prompt: `Architectural interior photography of a luxurious warm-toned modern ${data.rt}, elegant furniture, cinematic warm lighting, extremely detailed, photorealistic, 8k --ar 16:9`
            });
            setLoad(false);
        }, 2000);
    }, []);

    return (
        <div className="flex col fw fh fi" style={{ background: 'var(--bg)' }}>
            <div className="flex center" style={{ padding: 16, borderBottom: '3px solid var(--dim)' }}>
                <div className="wm" style={{ fontSize: 14 }}>SOFA, SO GOOD!</div>
                <div style={{ marginLeft: 12, fontSize: 7, color: 'var(--muted)', letterSpacing: 2 }}>⚔️ FINAL RENDER</div>
            </div>

            <div className="flex" style={{ flex: 1, minHeight: 0 }}>
                <div className="flex-1 col" style={{ padding: 32, overflowY: 'auto' }}>
                    {load ? (
                        <div className="flex col center fh">
                            <div style={{
                                width: 32, height: 32,
                                background: 'var(--copper)',
                                animation: 'spin 1s steps(8) infinite',
                                border: '3px solid #6B4420'
                            }} />
                            <div style={{ marginTop: 20, fontSize: 8, color: 'var(--copper)', letterSpacing: 2, textTransform: 'uppercase' }}>⛏️ Rendering World...</div>
                        </div>
                    ) : (
                        <div className="fi col" style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
                            <div className="flex" style={{ gap: 16, height: 320, marginBottom: 32 }}>
                                <div className="flex-1 col">
                                    <div style={{ fontSize: 7, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>📷 Original</div>
                                    {data.photo
                                        ? <img src={data.photo} className="fw fh" style={{ objectFit: 'cover', border: '3px solid var(--dim)', imageRendering: 'auto' }} />
                                        : <div className="fw fh" style={{ background: '#2a2318', border: '3px solid var(--dim)' }} />
                                    }
                                </div>
                                <div className="flex-1 col" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ fontSize: 7, color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {view3d ? "🎮 3D Preview" : "🎨 AI Render"}
                                        </div>
                                        <button className="btn bgo" style={{ padding: '3px 6px', fontSize: 6, borderColor: 'var(--copper)', color: 'var(--copper)' }} onClick={() => setView3d(!view3d)}>
                                            {view3d ? "→ 2D" : "→ 3D"}
                                        </button>
                                    </div>
                                    <div className="fw fh rel" style={{ overflow: 'hidden', border: '3px solid var(--copper)', flex: 1, boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
                                        {view3d ? (
                                            <Stage4a data={data} isPreviewMode={true} />
                                        ) : (
                                            <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent(desc.prompt)}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`} className="fw fh" style={{ objectFit: 'cover', imageRendering: 'auto' }} alt="AI generated room" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'; }} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h2 style={{ fontSize: 12, marginBottom: 12, color: 'var(--copper)' }}>📜 Design Narrative</h2>
                            <p style={{ fontSize: 8, lineHeight: 2, color: 'var(--muted)', marginBottom: 24 }}>{desc.text}</p>

                            <div style={{
                                background: 'var(--card)',
                                border: '3px solid',
                                borderColor: '#3A5A2A #2A4A1A #2A4A1A #3A5A2A',
                                borderLeft: '4px solid var(--green)',
                                padding: 20,
                                boxShadow: '4px 4px 0px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{ fontSize: 7, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🎯 Generation Prompt</div>
                                <div style={{ fontSize: 8, fontStyle: 'italic', color: 'var(--text)', lineHeight: 2 }}>{desc.prompt}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sb" style={{ padding: 20 }}>
                    <div style={{
                        background: 'var(--card)', padding: 12,
                        marginBottom: 20,
                        border: '3px solid',
                        borderColor: '#5A4A2E #3A2E1A #3A2E1A #5A4A2E',
                        boxShadow: '2px 2px 0px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{ fontSize: 7, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>🏠 Biome</div>
                        <div style={{ fontSize: 9, color: 'var(--copper)' }}>{data.rt || 'Custom Layout'}</div>
                    </div>

                    <div style={{ fontSize: 7, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📦 Blocks ({data.items.length})</div>
                    <div className="col" style={{ gap: 6, flex: 1, overflowY: 'auto' }}>
                        {data.items.map(it => (
                            <div key={it.uid} className="flex center" style={{
                                justifyContent: 'flex-start', gap: 10,
                                background: 'var(--card)', padding: '6px 10px',
                                border: '2px solid var(--dim)'
                            }}>
                                <span style={{ fontSize: 18 }}>{it.emoji}</span>
                                <span style={{ fontSize: 7, textTransform: 'uppercase' }}>{it.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="col" style={{ marginTop: 20, gap: 8 }}>
                        <button className="btn bg fw" style={{ padding: 14, fontSize: 8 }} onClick={reset}>⛏️ New World</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== APP ROOT =====
function App() {
    const [stage, setStage] = useState(1);
    const [data, setData] = useState({ photo: null, rt: '', obs: [], sugs: [], items: [] });

    const toStage2 = (d) => { setData(p => ({ ...p, photo: d.photo, rt: d.rt })); setStage(2); };
    const toStage3 = (d) => { setData(p => ({ ...p, obs: d.obs, sugs: d.sugs })); setStage(3); };
    const toStage4 = (d) => { setData(p => ({ ...p, items: d.items, layoutImg: d.layoutImg })); setStage(d.skip3D ? 4.2 : 4.1); };

    const toFinal = () => { setStage(4.2); };
    const backTo3 = () => setStage(3);
    const reset = () => { setData({ photo: null, rt: '', obs: [], sugs: [], items: [] }); setStage(1); };

    let content;
    if (stage === 1) content = <Stage1 onNext={toStage2} />;
    else if (stage === 2) content = <Stage2 data={data} onNext={toStage3} />;
    else if (stage === 3) content = <Stage3 data={data} nextStage={toStage4} />;
    else if (stage === 4.1) content = <Stage4a data={data} nextStage={toFinal} onBack={backTo3} />;
    else if (stage === 4.2) content = <Stage4b data={data} reset={reset} />;

    return (
      <>
        {stage === 1 && <FloatingFurniture />}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%' }}>
          {content}
        </div>
      </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
