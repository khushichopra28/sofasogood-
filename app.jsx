const { useState, useEffect, useRef, useCallback } = React;

const CATALOG = [
    { id: 'sofa', label: 'sofa', emoji: '🛋️', w: 160, h: 65, color: '#8B7D4A', h3d: 0.85, price: 25000 },
    { id: 'cupboard', label: 'cupboard', emoji: '🗄️', w: 80, h: 120, color: '#6B5B3A', h3d: 1.9, price: 12000 },
    { id: 'wardrobe', label: 'wardrobe', emoji: '🚪', w: 100, h: 130, color: '#5C4A2E', h3d: 1.9, price: 18000 },
    { id: 'bed', label: 'bed', emoji: '🛏️', w: 150, h: 110, color: '#C4884A', h3d: 0.55, price: 22000 },
    { id: 'desk', label: 'desk', emoji: '🖥️', w: 120, h: 60, color: '#D4C68E', h3d: 0.52, price: 8500 },
    { id: 'bookshelf', label: 'bookshelf', emoji: '📚', w: 70, h: 120, color: '#7A6438', h3d: 1.9, price: 9500 },
    { id: 'tv_unit', label: 'tv unit', emoji: '📺', w: 140, h: 50, color: '#3A3020', h3d: 0.52, price: 11000 },
    { id: 'armchair', label: 'armchair', emoji: '💺', w: 80, h: 75, color: '#C9A84C', h3d: 0.85, price: 8000 },
    { id: 'plant', label: 'plant', emoji: '🌿', w: 50, h: 65, color: '#5A8A3A', h3d: 1.0, price: 1500 },
    { id: 'lamp', label: 'lamp', emoji: '💡', w: 45, h: 110, color: '#F5F0E8', h3d: 1.65, price: 2500 },
    { id: 'rug', label: 'rug', emoji: '🟫', w: 160, h: 90, color: '#8B6B2A', h3d: 0.05, price: 6000 },
    { id: 'dining', label: 'dining', emoji: '🍽️', w: 130, h: 85, color: '#6B4420', h3d: 0.52, price: 15000 },
    { id: 'coffee', label: 'coffee', emoji: '☕', w: 100, h: 55, color: '#9A8C6A', h3d: 0.52, price: 5500 },
    { id: 'sideboard', label: 'sideboard', emoji: '🪵', w: 130, h: 55, color: '#5A4A2E', h3d: 0.52, price: 10000 }
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

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// ===== EXPORT TO PDF =====
function exportToPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 0;

    // --- Clean Header ---
    doc.setFillColor(35, 35, 35);
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('SOFA, SO GOOD!', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Interior Design Quotation', margin, 20);

    const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(dateStr, pageW - margin, 12, { align: 'right' });

    y = 38;

    // --- Room type ---
    if (data.rt) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Room:', margin, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(data.rt, margin + 16, y);
        y += 12;
    }

    // --- Thin separator ---
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    // --- Group items by catalog id, count quantities ---
    const grouped = {};
    data.items.forEach(it => {
        if (!grouped[it.id]) {
            grouped[it.id] = { ...it, qty: 0 };
        }
        grouped[it.id].qty += 1;
    });
    const rows = Object.values(grouped);
    const grandTotal = data.items.reduce((s, it) => s + (it.price || 0), 0);

    // --- Items Table ---
    const tableBody = rows.map((r, i) => [
        (i + 1).toString(),
        r.label.charAt(0).toUpperCase() + r.label.slice(1),
        formatCurrency(r.price || 0),
        r.qty.toString(),
        formatCurrency((r.price || 0) * r.qty)
    ]);

    doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head: [['#', 'Item', 'Unit Price', 'Qty', 'Line Total']],
        body: tableBody,
        theme: 'striped',
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [50, 50, 50],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left',
            lineColor: [200, 200, 200],
            lineWidth: 0.3
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [40, 40, 40],
            cellPadding: 5,
            lineColor: [230, 230, 230],
            lineWidth: 0.15
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left', cellWidth: 60 },
            2: { halign: 'right', cellWidth: 38 },
            3: { halign: 'center', cellWidth: 18 },
            4: { halign: 'right', cellWidth: 42 }
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: {
            font: 'helvetica',
            overflow: 'linebreak'
        }
    });

    y = doc.lastAutoTable.finalY + 2;

    // --- Grand Total Row (clean) ---
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Grand Total', margin, y);
    doc.text(formatCurrency(grandTotal), pageW - margin, y, { align: 'right' });

    y += 4;
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.8);
    doc.line(pageW - margin - 50, y, pageW - margin, y);

    // --- Footer ---
    const footerY = pageH - 12;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 6, pageW - margin, footerY - 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('Sofa, So Good! — Interior Design Quotation', margin, footerY);
    doc.text('Page 1', pageW - margin, footerY, { align: 'right' });

    doc.save('SofaSoGood_Quotation.pdf');
}

// ===== MODERN BUDGET HUD =====
function StickyBudgetBar({ items }) {
    const total = items.reduce((s, it) => s + (it.price || 0), 0);
    return (
        <div className="budget-hud anim-slide-down">
            <div className="budget-hud-inner">
                <div className="flex" style={{ gap: 40, alignItems: 'center' }}>
                    <div className="flex col">
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1 }}>PROJECT VALUE</span>
                        <span style={{ fontSize: 18, fontWeight: 800 }}>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex col">
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>ASSET COUNT</span>
                        <span style={{ fontSize: 18, fontWeight: 800 }}>{items.length} Units</span>
                    </div>
                </div>
                <div className="flex" style={{ gap: 12 }}>
                    <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.05)', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>Active Workspace</div>
                </div>
            </div>
        </div>
    );
}

// ===== MODERN UTILITIES =====
function ModernStatus({ label, value, icon }) {
    return (
        <div className="flex center" style={{ gap: 12, padding: '12px 20px', background: 'white', borderRadius: 16, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div className="col">
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{value}</span>
            </div>
        </div>
    );
}

function ModernProgress({ pct }) {
    return (
        <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
        </div>
    );
}

// ===== FLOATING FURNITURE SYSTEM (Blast Animation) =====
function FloatingFurniture() {
    const canvasRef = useRef(null);
    const furnitureRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let frame;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            furnitureRef.current = Array.from({ length: 15 }).map(() => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: 40 + Math.random() * 40,
                opacity: 0.05 + Math.random() * 0.1,
                emoji: ['🪴', '🪑', '🛋️', '🛋️'][Math.floor(Math.random() * 4)]
            }));
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            furnitureRef.current.forEach(f => {
                f.x += f.vx;
                f.y += f.vy;
                if (f.x < -100) f.x = canvas.width + 100;
                if (f.x > canvas.width + 100) f.x = -100;
                if (f.y < -100) f.y = canvas.height + 100;
                if (f.y > canvas.height + 100) f.y = -100;

                ctx.save();
                ctx.globalAlpha = f.opacity;
                ctx.font = `${f.size}px serif`;
                ctx.fillText(f.emoji, f.x, f.y);
                ctx.restore();
            });
            frame = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(frame);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ===== STAGE 1: UPLOAD / ROOM SELECT =====
function Stage1({ onNext }) {
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpload = (file) => {
        if (!file) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            onNext({ photo: e.target.result, rt: 'Living Room' });
            setLoading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex center fh fw col anim-fade" style={{ background: 'var(--bg)', padding: 40 }}>
            <div style={{ maxWidth: 640, textAlign: 'center' }}>
                <h1 className="brand" style={{ fontSize: 42, marginBottom: 12 }}>SOFA, <span>SO GOOD!</span></h1>
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 48, fontWeight: 300 }}>
                    Experience the future of interior design with our high-end AI vision engine.
                </p>
                
                <div 
                    className={`control-group ${dragging ? 'dragging' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById('file-upload').click()}
                    style={{
                        padding: 64,
                        background: 'white',
                        border: dragging ? '2px solid var(--accent)' : '2px dashed var(--border)',
                        borderRadius: 24,
                        cursor: 'pointer',
                        transition: '0.3s',
                        boxShadow: 'var(--shadow)'
                    }}
                >
                    <input id="file-upload" type="file" hidden onChange={e => handleUpload(e.target.files[0])} />
                    <div style={{ fontSize: 48, marginBottom: 20 }}>📸</div>
                    <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>Initialize Spatial Scan</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Drag & drop your floorplan or a photo of your current space</p>
                    <button className="btn-modern" style={{ marginTop: 24 }}>Browse Local Files</button>
                </div>

                <div className="flex center" style={{ marginTop: 40, gap: 40 }}>
                    <div className="flex center" style={{ gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>AI Precision</span>
                    </div>
                    <div className="flex center" style={{ gap: 10 }}>
                        <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Real-Time 3D</span>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="abs fw fh flex center col" style={{ background: 'rgba(255,255,255,0.7)', zIndex: 1000 }}>
                    <div style={{ width: 40, height: 40, border: '4px solid #eee', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            )}
        </div>
    );
}

// ===== STAGE 2: AI ANALYSIS =====
function Stage2({ data, onNext }) {
    const [pct, setPct] = useState(0);
    const [lbl, setLbl] = useState("Initializing vision engine...");
    const [findings, setFindings] = useState([]);

    useEffect(() => {
        let p = 0;
        const i = setInterval(() => {
            p += Math.random() * 8 + 2;
            if (p > 100) p = 100;
            setPct(p);
            if (p >= 28 && p < 58) setLbl("Detecting architectural volumes...");
            else if (p >= 58 && p < 88) setLbl("Sourcing optimal furniture geometries...");
            else if (p >= 88 && p < 100) setLbl("Finalizing spatial analysis...");

            if (p >= 100) {
                clearInterval(i);
                setTimeout(() => onNext({
                    obs: ["Deep walnut architectural textures", "Neutral beige surfaces with matte finish", "Natural lateral lighting from multiple zones", "Open-concept modern living plan"],
                    sugs: [{ id: 'sofa', reason: 'High-impact focal point for the main lounge' }, { id: 'rug', reason: 'Defines the central seating area' }, { id: 'plant', reason: 'Injects organic visual depth' }]
                }), 800);
            }
        }, 120);

        const to1 = setTimeout(() => setFindings(f => [...f, "Space: " + data.rt]), 400);
        const to2 = setTimeout(() => setFindings(f => [...f, "Lighting: Dual Zone Ambient"]), 1000);
        const to3 = setTimeout(() => setFindings(f => [...f, "Style Target: Contemporary Luxury"]), 1600);

        return () => { clearInterval(i); clearTimeout(to1); clearTimeout(to2); clearTimeout(to3); };
    }, [data, onNext]);

    return (
        <div className="flex center fh fw rel anim-fade" style={{ background: '#F9FAFB' }}>
            <div className="col" style={{ width: 440, background: 'white', padding: 48, borderRadius: 28, boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: 2, marginBottom: 8 }}>AI VISION ENGINE</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lbl}</div>
                </div>

                <ModernProgress pct={pct} />
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textAlign: 'right', marginTop: 8 }}>{Math.round(pct)}% COMPLETE</div>

                <div className="col" style={{ marginTop: 40, gap: 16 }}>
                    {findings.map((f, i) => (
                        <div key={i} className="flex" style={{ alignItems: 'center', gap: 16, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                            <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }} />
                            {f}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ===== STAGE 3: DESIGN CANVAS =====
function Stage3({ data, nextStage, onItemsChange }) {
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

    // Sync items to App whenever they change
    useEffect(() => {
        if (onItemsChange) onItemsChange(items);
    }, [items, onItemsChange]);

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
        <div className="flex fw fh col anim-fade" style={{ background: 'var(--bg)' }}>
            <div className="flex flex-1" style={{ minHeight: 0 }}>
                <div className="viewport flex-1 rel" ref={wrapRef} onMouseDown={(e) => { if (e.target === wrapRef.current) setSel(null); }}>
                    <div className="cv-grid"></div>
                    
                    {/* Ghost hints */}
                    {hints && data.sugs.slice(0, 2).map((s, i) => {
                        const cat = CATALOG.find(c => c.id === s.id);
                        if (!cat) return null;
                        return (
                            <div key={i} style={{ position: 'absolute', left: 200 + i * 200, top: 200 + i * 100, width: cat.w, height: cat.h, border: '2px dashed var(--accent)', opacity: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>AI: {cat.label}</div>
                            </div>
                        );
                    })}

                    {/* Items */}
                    {items.map(it => (
                        <div key={it.uid} 
                            style={{ 
                                position: 'absolute', left: it.x, top: it.y, width: it.w, height: it.h, 
                                background: it.color, cursor: 'grab', zIndex: sel === it.uid ? 100 : 5,
                                border: sel === it.uid ? '3px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)',
                                boxShadow: sel === it.uid ? 'var(--shadow-lg)' : 'var(--shadow)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 4
                            }}
                            onMouseDown={(e) => { e.stopPropagation(); setSel(it.uid); setTab('props'); setDrag({ type: 'move', uid: it.uid, startX: e.clientX, startY: e.clientY, initX: it.x, initY: it.y }); }}>
                            <div style={{ fontSize: 24, userSelect: 'none' }}>{it.emoji}</div>
                            {sel === it.uid && (
                                <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, background: 'var(--accent)', cursor: 'nwse-resize', borderRadius: '50%', border: '3px solid white' }}
                                    onMouseDown={(e) => { e.stopPropagation(); setDrag({ type: 'resize', uid: it.uid, startX: e.clientX, startY: e.clientY, initW: it.w, initH: it.h }); }} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="sb">
                    <div className="tab-row">
                        {['items', 'ideas', 'blueprint', 'props'].map(t => (
                            <div key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                                {t === 'items' ? 'Catalog' : t === 'ideas' ? 'AI Guide' : t === 'blueprint' ? 'Sketch' : 'Edit'}
                            </div>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                        {tab === 'items' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {CATALOG.map(cat => {
                                    const added = items.some(i => i.id === cat.id);
                                    return (
                                        <div key={cat.id} className="product-card" onClick={() => addItem(cat)}>
                                            <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</div>
                                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{cat.label}</div>
                                            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(cat.price)}</div>
                                            {added && <div className="abs" style={{ top: 8, right: 8, color: 'var(--accent)', fontSize: 12 }}>✓</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {tab === 'ideas' && (
                            <div className="col" style={{ gap: 20 }}>
                                <div className="control-group">
                                    <label className="control-label">AI SPATIAL ANALYSIS</label>
                                    {data.obs.map((o, i) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>▸ {o}</p>)}
                                </div>
                                {data.sugs.map((s, i) => {
                                    const c = CATALOG.find(cat => cat.id === s.id);
                                    if (!c) return null;
                                    return (
                                        <div key={i} className="product-card" style={{ flexDirection: 'row', textAlign: 'left', padding: 12, gap: 16 }}>
                                            <div style={{ fontSize: 24 }}>{c.emoji}</div>
                                            <div className="flex-1">
                                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{c.label}</div>
                                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{s.reason}</p>
                                                <button className="btn-modern" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => addItem(c)}>Add Item</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {tab === 'blueprint' && (
                            <div>
                                <label className="control-label">📏 AutoCAD Technical View</label>
                                <div style={{ width: '100%', height: 320, background: '#111827', borderRadius: 16, overflow: 'hidden', border: '1px solid #1F2937' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 800 600">
                                        <rect x="10" y="10" width="780" height="580" fill="none" stroke="#374151" strokeWidth="2" strokeDasharray="6" opacity="0.5" />
                                        {items.map(it => (
                                            <g key={it.uid} transform={`translate(${it.x}, ${it.y})`}>
                                                <rect width={it.w} height={it.h} fill="rgba(176,141,87,0.1)" stroke="var(--accent)" strokeWidth="1.5" />
                                                <text x={it.w/2} y={it.h/2} textAnchor="middle" fill="#9CA3AF" fontSize="10">{it.label.toUpperCase()}</text>
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        )}

                        {tab === 'props' && (
                            <div>
                                {!curItem ? (
                                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40, fontSize: 13 }}>Select an object to customize</div>
                                ) : (
                                    <div className="col" style={{ gap: 32 }}>
                                        <div style={{ textAlign: 'center', fontSize: 64, marginBottom: 12 }}>{curItem.emoji}</div>
                                        <div>
                                            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 700 }}>WIDTH</span><span style={{ fontSize: 11 }}>{Math.round(curItem.w)}cm</span></div>
                                            <input type="range" style={{ width: '100%' }} min="40" max="280" value={curItem.w} onChange={e => setItems(prev => prev.map(i => i.uid === sel ? { ...i, w: parseInt(e.target.value) } : i))} />
                                        </div>
                                        <div>
                                            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 700 }}>DEPTH</span><span style={{ fontSize: 11 }}>{Math.round(curItem.h)}cm</span></div>
                                            <input type="range" style={{ width: '100%' }} min="30" max="200" value={curItem.h} onChange={e => setItems(prev => prev.map(i => i.uid === sel ? { ...i, h: parseInt(e.target.value) } : i))} />
                                        </div>
                                        <button className="btn-modern" style={{ background: '#EF4444', width: '100%' }} onClick={() => delItem(sel)}>Delete Object</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 24, borderTop: '1px solid var(--border)' }}>
                        <button className="btn-modern fw" style={{ padding: 14 }} onClick={() => nextStage({ items })}>Generate 3D Preview →</button>
                        <button className="btn-outline fw" style={{ marginTop: 12, padding: 12 }} onClick={() => nextStage({ items, skip3D: true })}>Skip Visualization</button>
                    </div>
                </div>
            </div>
            {toast && <div className="abs anim-fade" style={{ bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'white', padding: '12px 24px', borderRadius: 100, fontSize: 13, zIndex: 1000 }}>{toast}</div>}
        </div>
    );
}

// ===== STAGE 4A: 3D PREVIEW =====
function Stage4a({ data, nextStage, onBack, isPreviewMode }) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const wallRef = useRef([]);
    const floorRef = useRef(null);
    const curtainsRef = useRef({}); // Multiple curtains
    const lightsRef = useRef({});
    
    const [lights, setLights] = useState({ ambient: true, daylight: false, warm: true });
    const [config, setConfig] = useState({ 
        wallColor: '#eae6df', 
        floorType: 'walnut', 
        showLeftCurtain: true,
        showBackCurtain: false,
        curtainColor: '#f5f0e8'
    });

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
        floorRef.current = floor;

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

        const wallMat = new THREE.MeshStandardMaterial({ color: config.wallColor });
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(RM_W, RM_H), wallMat);
        backWall.position.set(0, RM_H / 2, -RM_D / 2);
        backWall.receiveShadow = true;
        scene.add(backWall);
        wallRef.current.push(backWall);

        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(RM_D, RM_H), wallMat);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-RM_W / 2, RM_H / 2, 0);
        leftWall.receiveShadow = true;
        scene.add(leftWall);
        wallRef.current.push(leftWall);

        // --- Curtains & Windows ---
        function addCurtain(x, z, rot, key) {
            const group = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color: config.curtainColor, roughness: 0.8, side: THREE.DoubleSide });
            const h = RM_H * 0.95;
            const fds = 10;
            const fw = 0.15;
            for (let i = 0; i < fds; i++) {
                const g = new THREE.CylinderGeometry(fw, fw, h, 8, 1, true, 0, Math.PI);
                const m = new THREE.Mesh(g, mat);
                m.position.set(0, h/2, - (fds * fw / 2) + i * (fw * 1.1));
                m.rotation.y = Math.PI / 2;
                group.add(m);
            }
            group.position.set(x, 0, z);
            group.rotation.y = rot;
            group.visible = key === 'left' ? config.showLeftCurtain : config.showBackCurtain;
            scene.add(group);
            curtainsRef.current[key] = group;
        }

        addCurtain(-RM_W/2 + 0.1, 0, 0, 'left');
        addCurtain(0, -RM_D/2 + 0.1, Math.PI/2, 'back');

        const winGeo = new THREE.PlaneGeometry(3, 2);
        const winMat = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: 2, transparent: true, opacity: 0.8 });
        
        const winL = new THREE.Mesh(winGeo, winMat);
        winL.rotation.y = Math.PI / 2;
        winL.position.set(-RM_W / 2 + 0.01, 2, 0);
        scene.add(winL);

        const winB = new THREE.Mesh(winGeo, winMat);
        winB.position.set(0, 2, -RM_D / 2 + 0.01);
        scene.add(winB);

        // --- Procedural 3D Furniture Builder ---
        function buildFurniture3D(id, color, tw, td) {
            const group = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.55, metalness: 0.05 });
            const matDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.7), roughness: 0.6 });
            const matLight = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.3), roughness: 0.4 });
            const white = new THREE.MeshStandardMaterial({ color: '#f5f0e8', roughness: 0.5 });
            const fabric = new THREE.MeshStandardMaterial({ color: '#c9a84c', roughness: 0.8 });

            const addBox = (w, h, d, x, y, z, m) => {
                const g = new THREE.BoxGeometry(w, h, d);
                const mesh = new THREE.Mesh(g, m || mat);
                mesh.position.set(x, y, z);
                mesh.castShadow = true; mesh.receiveShadow = true;
                group.add(mesh);
                return mesh;
            };

            switch(id) {
                case 'sofa': {
                    const sw = Math.max(tw, 1.5), sd = Math.max(td, 0.7);
                    addBox(sw, 0.35, sd, 0, 0.175, 0, mat);          // seat base
                    addBox(sw, 0.45, 0.1, 0, 0.575, -sd/2+0.05, mat); // back rest
                    addBox(0.12, 0.3, sd, -sw/2+0.06, 0.5, 0, mat);   // left arm
                    addBox(0.12, 0.3, sd, sw/2-0.06, 0.5, 0, mat);    // right arm
                    addBox(sw*0.85, 0.08, sd*0.7, 0, 0.38, 0.05, fabric); // cushion
                    break;
                }
                case 'bed': {
                    const bw = Math.max(tw, 1.8), bd = Math.max(td, 1.2);
                    addBox(bw, 0.28, bd, 0, 0.14, 0, mat);             // base frame
                    addBox(bw, 0.55, 0.08, 0, 0.415, -bd/2+0.04, matDark); // headboard
                    addBox(bw*0.92, 0.12, bd*0.88, 0, 0.34, 0.03, white);  // mattress
                    addBox(bw*0.4, 0.06, 0.28, 0, 0.43, -bd/2+0.22, matLight); // pillow
                    break;
                }
                case 'desk': {
                    const dw = Math.max(tw, 1.0), dd = Math.max(td, 0.5);
                    addBox(dw, 0.04, dd, 0, 0.72, 0, mat);           // top
                    addBox(0.05, 0.7, 0.05, -dw/2+0.06, 0.35, -dd/2+0.06, matDark); // leg FL
                    addBox(0.05, 0.7, 0.05, dw/2-0.06, 0.35, -dd/2+0.06, matDark);  // leg FR
                    addBox(0.05, 0.7, 0.05, -dw/2+0.06, 0.35, dd/2-0.06, matDark);  // leg BL
                    addBox(0.05, 0.7, 0.05, dw/2-0.06, 0.35, dd/2-0.06, matDark);   // leg BR
                    break;
                }
                case 'cupboard': {
                    const cw = Math.max(tw, 0.7), cd = Math.max(td, 0.4);
                    addBox(cw, 1.5, cd, 0, 0.75, 0, mat);            // body
                    addBox(0.02, 0.3, 0.02, -0.08, 0.9, cd/2+0.01, matDark); // handle L
                    addBox(0.02, 0.3, 0.02, 0.08, 0.9, cd/2+0.01, matDark);  // handle R
                    addBox(cw*0.95, 0.02, cd*0.9, 0, 0.75, 0, matDark);  // middle shelf line
                    break;
                }
                case 'wardrobe': {
                    const ww = Math.max(tw, 0.9), wd = Math.max(td, 0.5);
                    addBox(ww, 1.8, wd, 0, 0.9, 0, mat);            // body
                    addBox(0.01, ww > 0.6 ? 1.78 : 1.5, 0.01, 0, 0.9, wd/2+0.005, matDark); // center line
                    addBox(0.02, 0.2, 0.02, -0.1, 1.0, wd/2+0.01, matDark); // handle L
                    addBox(0.02, 0.2, 0.02, 0.1, 1.0, wd/2+0.01, matDark);  // handle R
                    break;
                }
                case 'bookshelf': {
                    const bsw = Math.max(tw, 0.6), bsd = Math.max(td, 0.3);
                    addBox(bsw, 1.6, bsd, 0, 0.8, 0, mat);          // frame
                    for (let i = 0; i < 4; i++) {
                        addBox(bsw*0.88, 0.02, bsd*0.85, 0, 0.25 + i*0.38, 0, matDark); // shelves
                        if (i < 3) {
                            const bkW = 0.04 + Math.random()*0.04;
                            const bkH = 0.18 + Math.random()*0.08;
                            const bkColor = ['#8B4513', '#A0522D', '#6B4420', '#5C4A2E', '#D4A574'][i % 5];
                            const bkMat = new THREE.MeshStandardMaterial({ color: bkColor, roughness: 0.7 });
                            for (let j = 0; j < 3; j++) {
                                addBox(bkW, bkH, bsd*0.6, -bsw*0.3 + j*0.15, 0.27 + i*0.38 + bkH/2, 0, bkMat);
                            }
                        }
                    }
                    break;
                }
                case 'tv_unit': {
                    const tvw = Math.max(tw, 1.2), tvd = Math.max(td, 0.35);
                    addBox(tvw, 0.4, tvd, 0, 0.2, 0, mat);          // cabinet
                    addBox(tvw*0.7, 0.5, 0.03, 0, 0.65, -tvd/2+0.1, new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.2, metalness: 0.5 })); // TV screen
                    break;
                }
                case 'armchair': {
                    const aw = Math.max(tw, 0.6), ad = Math.max(td, 0.6);
                    addBox(aw, 0.3, ad, 0, 0.15, 0, mat);           // seat
                    addBox(aw, 0.4, 0.08, 0, 0.5, -ad/2+0.04, mat);  // back
                    addBox(0.1, 0.25, ad, -aw/2+0.05, 0.4, 0, mat);   // arm L
                    addBox(0.1, 0.25, ad, aw/2-0.05, 0.4, 0, mat);    // arm R
                    addBox(aw*0.75, 0.06, ad*0.7, 0, 0.33, 0.03, fabric); // cushion
                    break;
                }
                case 'plant': {
                    const potMat = new THREE.MeshStandardMaterial({ color: '#8B5E3C', roughness: 0.8 });
                    const leafMat = new THREE.MeshStandardMaterial({ color: '#3A7A20', roughness: 0.7 });
                    addBox(0.2, 0.25, 0.2, 0, 0.125, 0, potMat);    // pot
                    const leafGeo = new THREE.SphereGeometry(0.25, 8, 6);
                    const leaves = new THREE.Mesh(leafGeo, leafMat);
                    leaves.position.set(0, 0.5, 0);
                    leaves.scale.set(1, 1.3, 1);
                    leaves.castShadow = true;
                    group.add(leaves);
                    const leafGeo2 = new THREE.SphereGeometry(0.18, 8, 6);
                    const leaves2 = new THREE.Mesh(leafGeo2, leafMat);
                    leaves2.position.set(0.1, 0.7, 0.05);
                    leaves2.castShadow = true;
                    group.add(leaves2);
                    break;
                }
                case 'lamp': {
                    const poleMat = new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.3, metalness: 0.6 });
                    const shadeMat = new THREE.MeshStandardMaterial({ color: '#F5F0E8', roughness: 0.6, side: THREE.DoubleSide });
                    addBox(0.2, 0.02, 0.2, 0, 0.01, 0, poleMat);      // base
                    addBox(0.03, 1.3, 0.03, 0, 0.66, 0, poleMat);     // pole
                    const shadeGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.25, 8, 1, true);
                    const shade = new THREE.Mesh(shadeGeo, shadeMat);
                    shade.position.set(0, 1.38, 0);
                    shade.castShadow = true;
                    group.add(shade);
                    break;
                }
                case 'rug': {
                    const rw = Math.max(tw, 1.5), rd = Math.max(td, 1.0);
                    const rugMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
                    addBox(rw, 0.02, rd, 0, 0.01, 0, rugMat);
                    const borderMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.6), roughness: 0.9 });
                    addBox(rw, 0.025, 0.04, 0, 0.013, -rd/2+0.02, borderMat);
                    addBox(rw, 0.025, 0.04, 0, 0.013, rd/2-0.02, borderMat);
                    addBox(0.04, 0.025, rd, -rw/2+0.02, 0.013, 0, borderMat);
                    addBox(0.04, 0.025, rd, rw/2-0.02, 0.013, 0, borderMat);
                    break;
                }
                case 'dining': {
                    const dtw = Math.max(tw, 1.2), dtd = Math.max(td, 0.8);
                    addBox(dtw, 0.04, dtd, 0, 0.74, 0, mat);       // top
                    addBox(0.06, 0.7, 0.06, -dtw/2+0.1, 0.35, -dtd/2+0.1, matDark);
                    addBox(0.06, 0.7, 0.06, dtw/2-0.1, 0.35, -dtd/2+0.1, matDark);
                    addBox(0.06, 0.7, 0.06, -dtw/2+0.1, 0.35, dtd/2-0.1, matDark);
                    addBox(0.06, 0.7, 0.06, dtw/2-0.1, 0.35, dtd/2-0.1, matDark);
                    break;
                }
                case 'coffee': {
                    const ctw = Math.max(tw, 0.8), ctd = Math.max(td, 0.5);
                    addBox(ctw, 0.03, ctd, 0, 0.42, 0, mat);       // top
                    addBox(0.04, 0.4, 0.04, -ctw/2+0.08, 0.2, -ctd/2+0.08, matDark);
                    addBox(0.04, 0.4, 0.04, ctw/2-0.08, 0.2, -ctd/2+0.08, matDark);
                    addBox(0.04, 0.4, 0.04, -ctw/2+0.08, 0.2, ctd/2-0.08, matDark);
                    addBox(0.04, 0.4, 0.04, ctw/2-0.08, 0.2, ctd/2-0.08, matDark);
                    break;
                }
                case 'sideboard': {
                    const sbw = Math.max(tw, 1.2), sbd = Math.max(td, 0.35);
                    addBox(sbw, 0.65, sbd, 0, 0.325, 0, mat);
                    addBox(sbw*0.95, 0.02, 0.01, 0, 0.65, sbd/2+0.005, matDark); // top edge
                    for (let i = 0; i < 3; i++) {
                        addBox(0.02, 0.12, 0.02, -sbw*0.3 + i*sbw*0.3, 0.35, sbd/2+0.01, matDark); // handles
                    }
                    break;
                }
                default: {
                    const h = 0.8;
                    addBox(tw, h, td, 0, h/2, 0, mat);
                }
            }
            return group;
        }

        // --- Place furniture using actual canvas dimensions ---
        const canvasW = W;
        const canvasH = H;

        data.items.forEach(it => {
            const cx = (it.x + it.w / 2) / canvasW * RM_W - RM_W / 2;
            const cz = (it.y + it.h / 2) / canvasH * RM_D - RM_D / 2;
            const targetW = Math.max((it.w / canvasW) * RM_W, 0.3);
            const targetD = Math.max((it.h / canvasH) * RM_D, 0.3);

            const furnitureGroup = buildFurniture3D(it.id, it.color, targetW, targetD);
            furnitureGroup.position.set(cx, 0, cz);
            scene.add(furnitureGroup);
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
    }, [data.items, config]);

    useEffect(() => {
        if (!lightsRef.current) return;
        if (lightsRef.current.ambient) lightsRef.current.ambient.intensity = lights.ambient ? 0.6 : 0.1;
        if (lightsRef.current.daylight) lightsRef.current.daylight.intensity = lights.daylight ? 0.8 : 0;
        if (lightsRef.current.warm) lightsRef.current.warm.intensity = lights.warm ? 1 : 0;
    }, [lights]);

    useEffect(() => {
        if (wallRef.current.length > 0) {
            wallRef.current.forEach(w => w.material.color.set(config.wallColor));
        }
        if (floorRef.current) {
            floorRef.current.material.color.set(config.floorType === 'walnut' ? '#ffffff' : config.floorType === 'light' ? '#e8dCC4' : '#5c4033');
        }
        if (curtainsRef.current.left) {
            curtainsRef.current.left.visible = config.showLeftCurtain;
            curtainsRef.current.left.children.forEach(c => c.material.color.set(config.curtainColor));
        }
        if (curtainsRef.current.back) {
            curtainsRef.current.back.visible = config.showBackCurtain;
            curtainsRef.current.back.children.forEach(c => c.material.color.set(config.curtainColor));
        }
    }, [config]);


    return (
        <div className="flex fw fh anim-fade" style={{ background: 'var(--bg)', position: 'relative' }}>
            <div className="flex-1 rel" ref={mountRef} style={{ cursor: 'grab', background: '#EDE8DE', overflow: 'hidden' }}>
                <div className="abs" style={{ top: 32, left: 32, zIndex: 100 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '20px 32px', borderRadius: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>3D PERSPECTIVE</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Orbit established • PBR Materials Active</div>
                        {!isPreviewMode && <button className="btn-outline" style={{ marginTop: 24, fontSize: 11, padding: '8px 16px' }} onClick={onBack}>← Back to Blueprint</button>}
                    </div>
                </div>
            </div>

            {!isPreviewMode && (
                <div className="sb" style={{ padding: 40, borderLeft: '1px solid var(--border)', background: 'white' }}>
                    <div className="col" style={{ gap: 40, flex: 1, overflowY: 'auto' }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>🔆 Scene Illumination</div>
                            <div className="col" style={{ gap: 16 }}>
                                {[
                                    { id: 'ambient', label: 'Ambient Soft Glow', icon: '☁️' },
                                    { id: 'daylight', label: 'Daylight Entry', icon: '☀️' },
                                    { id: 'warm', label: 'Copper Warmth', icon: '🔥' }
                                ].map(l => (
                                    <div key={l.id} className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
                                            <span style={{ fontSize: 18 }}>{l.icon}</span>
                                            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{l.label}</span>
                                        </div>
                                        <div className={`switch-premium ${lights[l.id] ? 'active' : ''}`} onClick={() => setLights(p => ({ ...p, [l.id]: !p[l.id] }))}>
                                            <div className="thumb" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>🎨 Structural Finish</div>
                            <div className="col" style={{ gap: 24 }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Architectural Wall Palette</div>
                                    <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
                                        {['#eae6df', '#f5f0e8', '#dcd8cf', '#c4bfb6', '#b5a68e'].map(c => (
                                            <div key={c} onClick={() => setConfig(p => ({...p, wallColor: c}))} 
                                                style={{ width: 28, height: 28, borderRadius: 8, background: c, border: config.wallColor === c ? '2px solid var(--accent)' : '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Hardwood Selection</div>
                                    <div className="flex" style={{ gap: 8 }}>
                                        {[
                                            { id: 'light', col: '#e8dCC4', label: 'Silver Oak' },
                                            { id: 'walnut', col: '#8B5E3C', label: 'Walnut' },
                                            { id: 'dark', col: '#5c4033', label: 'Ebony' }
                                        ].map(f => (
                                            <div key={f.id} onClick={() => setConfig(p => ({...p, floorType: f.id}))} 
                                                style={{ 
                                                    flex: 1, padding: '12px 6px', borderRadius: 12, fontSize: 11, fontWeight: 700, textAlign: 'center', background: f.col, color: '#fff',
                                                    border: config.floorType === f.id ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', transition: '0.2s'
                                                }}>{f.label}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>🏢 Interior Architecture</div>
                            <div className="col" style={{ gap: 16 }}>
                                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Left Wall Curtains</span>
                                    <div className={`switch-premium ${config.showLeftCurtain ? 'active' : ''}`} onClick={() => setConfig(p => ({ ...p, showLeftCurtain: !p.showLeftCurtain }))}>
                                        <div className="thumb" />
                                    </div>
                                </div>
                                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Back Wall Curtains</span>
                                    <div className={`switch-premium ${config.showBackCurtain ? 'active' : ''}`} onClick={() => setConfig(p => ({ ...p, showBackCurtain: !p.showBackCurtain }))}>
                                        <div className="thumb" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <button className="btn-modern fw" style={{ padding: 24, fontSize: 14 }} onClick={() => nextStage()}>Finalize Project View ✦</button>
                        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>Real-time spatial synchronization active.</p>
                    </div>
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
        const itemLabels = data.items.map(it => it.label).join(", ");
        const obsList = (data.obs || []).join(", ");
        const roomType = data.rt || "Living Room";

        const prompt = `Architectural interior photography of a luxurious ${roomType}. Features: ${obsList}. Furnished with: ${itemLabels}. Style: cinematic warm lighting, extremely detailed, photorealistic, 8k, elegant furniture, matching the original room layout --ar 16:9`;

        setTimeout(() => {
            setDesc({
                text: `A cozy ${roomType} crafted with ${obsList.toLowerCase()}. The space is anchored by ${itemLabels.toLowerCase()}, arranged to maximize flow and visual depth. Warm copper lighting and rich golden tones create an inviting, game-world atmosphere.`,
                prompt: prompt
            });
            setLoad(false);
        }, 2000);
    }, [data.items, data.obs, data.rt]);

    return (
        <div className="flex col fw fh anim-fade" style={{ background: 'var(--bg)', overflowY: 'auto' }}>
            <div className="flex flex-1" style={{ minHeight: 0 }}>
                <div className="flex-1" style={{ padding: 48, overflowY: 'auto' }}>
                    {load ? (
                        <div className="flex center col fh" style={{ minHeight: 400 }}>
                            <div style={{ width: 64, height: 64, border: '4px solid #eee', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
                            <div style={{ marginTop: 24, fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2 }}>GENERATING HIGH-RESOLUTION ASSETS...</div>
                        </div>
                    ) : (
                        <div className="anim-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
                            <div className="flex" style={{ gap: 32, height: 440, marginBottom: 48 }}>
                                <div className="flex-1 col">
                                    <label className="control-label">📷 Reference Layout</label>
                                    <div className="fw fh" style={{ borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                                        {data.photo ? <img src={data.photo} className="fw fh" style={{ objectFit: 'cover' }} /> : <div className="fw fh" style={{ background: '#eee' }} />}
                                    </div>
                                </div>
                                <div className="flex-1 col">
                                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <label className="control-label" style={{ marginBottom: 0 }}>🎨 4K Architectural Visualization</label>
                                        <button className="btn-outline" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => setView3d(!view3d)}>{view3d ? "View Static" : "Interactive 3D"}</button>
                                    </div>
                                    <div className="fw fh" style={{ borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', position: 'relative' }}>
                                        {view3d ? <Stage4a data={data} isPreviewMode={true} /> : <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent(desc.prompt)}?width=1000&height=800&nologo=true&seed=88`} className="fw fh" style={{ objectFit: 'cover' }} />}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow)', marginBottom: 40 }}>
                                <h2 style={{ fontSize: 28, marginBottom: 16, fontWeight: 800, letterSpacing: '-0.5px' }}>Design Narrative</h2>
                                <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 32 }}>{desc.text}</p>
                                
                                <div className="control-group" style={{ background: '#F9FAFB', borderLeft: '4px solid var(--accent)' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>AI ENGINE PROMPT</div>
                                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>{desc.prompt}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sb" style={{ padding: 32 }}>
                    <div className="control-group" style={{ marginBottom: 32 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>Environment</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{data.rt || 'Custom Workspace'}</div>
                    </div>

                    <label className="control-label">Inventory List ({data.items.length})</label>
                    <div className="col" style={{ gap: 10, flex: 1, overflowY: 'auto', marginBottom: 32 }}>
                        {data.items.map(it => (
                            <div key={it.uid} className="flex" style={{ alignItems: 'center', gap: 16, padding: '12px 16px', background: '#fcfcfc', border: '1px solid var(--border)', borderRadius: 12 }}>
                                <span style={{ fontSize: 24 }}>{it.emoji}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{it.label}</span>
                            </div>
                        ))}
                    </div>

                    <button className="btn-modern fw" style={{ padding: 20 }} onClick={reset}>Start New Project</button>
                    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>Project data and technical exports synchronized.</p>
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

    const handleItemsChange = useCallback((newItems) => {
        setData(p => ({ ...p, items: newItems }));
    }, []);

    const handleExport = () => {
        if (window.exportToPDF) window.exportToPDF(data);
    };

    let content;
    if (stage === 1) content = <Stage1 onNext={toStage2} />;
    else if (stage === 2) content = <Stage2 data={data} onNext={toStage3} />;
    else if (stage === 3) content = <Stage3 data={data} nextStage={toStage4} onItemsChange={handleItemsChange} />;
    else if (stage === 4.1) content = <Stage4a data={data} nextStage={toFinal} onBack={backTo3} />;
    else if (stage === 4.2) content = <Stage4b data={data} reset={reset} />;

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
            <nav className="top-nav">
                <div className="brand">SOFA, <span>SO GOOD!</span></div>
                <div className="flex" style={{ gap: 24 }}>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} style={{ 
                            width: 12, height: 12, borderRadius: '50%', 
                            background: Math.floor(stage) >= s ? 'var(--accent)' : 'var(--border)',
                            transition: '0.3s'
                        }} />
                    ))}
                </div>
                {stage >= 3 && <button className="btn-outline" style={{ fontSize: 11, padding: '8px 16px' }} onClick={handleExport}>Download Project PDF</button>}
            </nav>
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {stage >= 3 && <StickyBudgetBar items={data.items} roomType={data.rt} />}
                {content}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
