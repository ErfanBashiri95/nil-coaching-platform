function Planet3DNode({ node, onClick }) {
    const containerRef = React.useRef(null);


    React.useEffect(() => {
        if (!containerRef.current || !window.THREE) return;

        const isMobile = window.innerWidth < 768;

        const size = Number(isMobile ? node.size_mobile : node.size_desktop) || 200;
        const speed = Number(isMobile ? node.speed_mobile : node.speed_desktop) || 0.006;
        const direction = node.direction === "left" ? -1 : 1;

        const container = containerRef.current;
        container.innerHTML = "";

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.z = 4;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });

        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

        if (THREE.SRGBColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }

        if (THREE.NoToneMapping) {
            renderer.toneMapping = THREE.NoToneMapping;
        }

        renderer.toneMappingExposure = 1;

        container.appendChild(renderer.domElement);

        const geometry = new THREE.SphereGeometry(1, 64, 64);

        let texture = null;
        let material;

        if (node.texture_path) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.setCrossOrigin("anonymous");

            material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0,
            });

            texture = textureLoader.load(
                node.texture_path,
                () => {
                    if (THREE.SRGBColorSpace) {
                        texture.colorSpace = THREE.SRGBColorSpace;
                    } else if (THREE.sRGBEncoding) {
                        texture.encoding = THREE.sRGBEncoding;
                    }

                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(1, 1);

                    material.map = texture;
                    material.opacity = 1;
                    material.needsUpdate = true;

                    renderer.render(scene, camera);
                },
                undefined,
                () => {
                    material.opacity = 1;
                    material.color = new THREE.Color(node.color || "#3b82f6");
                    material.needsUpdate = true;
                }
            );
        } else {
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(node.color || "#3b82f6"),
                roughness: 0.45,
                metalness: 0.08,
            });
        }

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const light = new THREE.DirectionalLight(0xffffff, 2.2);
        light.position.set(5, 3, 5);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(
            new THREE.Color(node.color || "#3b82f6"),
            0.7
        );
        scene.add(ambientLight);

        let animationId;

        function animate() {
            animationId = requestAnimationFrame(animate);
            sphere.rotation.y += speed * direction;
            renderer.render(scene, camera);
        }

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            geometry.dispose();

            if (texture) {
                texture.dispose();
            }

            material.dispose();

            renderer.forceContextLoss();
            renderer.dispose();

            container.innerHTML = "";
        };

    }, [
        node.id,
        node.texture_path,
        node.color,
        node.size_desktop,
        node.size_mobile,
        node.speed_desktop,
        node.speed_mobile,
        node.direction,
    ]);

    const isMobile = window.innerWidth < 768;

    const size = Number(isMobile ? node.size_mobile : node.size_desktop) || 200;

    const x =
        node._renderX !== undefined
            ? Number(node._renderX)
            : Number(isMobile ? node.x_mobile : node.x_desktop) || 0;

    const y =
        node._renderY !== undefined
            ? Number(node._renderY)
            : Number(isMobile ? node.y_mobile : node.y_desktop) || 0;

    return (
        <div
            className="planet-node"
            onClick={() => onClick(node)}
            style={{
                position: "absolute",
                width: `${size}px`,
                height: `${size}px`,
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                cursor: "pointer",
                pointerEvents: "auto",
            }}
        >

            <div
                className="planet-hover-glow"
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: `${size * 0.95}px`,
                    height: `${size * 0.95}px`,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.22)",
                    filter: "blur(18px)",
                    opacity: 0,
                    transition: "opacity 0.25s ease",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />


            <div
                ref={containerRef}
                className="planet-visual-enter"
                style={{
                    position: "relative",
                    zIndex: 1,
                }}
            />


            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "-8px",
                    transform: "translateX(-50%)",
                    color: "#ffffff",
                    fontWeight: "900",
                    fontSize: "15px",
                    textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                    whiteSpace: "nowrap",
                }}
            >
                {node.title}
            </div>
        </div>
    );
}



function PlanetSystem({ onGoConsult }) {
    const [planets, setPlanets] = React.useState([]);
    const [openNodeIds, setOpenNodeIds] = React.useState({});
    const [activeBranchId, setActiveBranchId] = React.useState(null);
    const [contentModal, setContentModal] = React.useState(null);
    const [loadingContent, setLoadingContent] = React.useState(false);
    const [galleryViewer, setGalleryViewer] = React.useState(null);
    const [galleryIndex, setGalleryIndex] = React.useState(0);
    const [openFaqIndex, setOpenFaqIndex] = React.useState(null);



    React.useEffect(() => {
        loadPlanets();
    }, []);

    React.useEffect(() => {

        function handleKeyDown(e) {

            if (!galleryViewer) return;

            if (e.key === "Escape") {
                setGalleryViewer(null);
            }

            if (e.key === "ArrowLeft") {
                setGalleryIndex((prev) =>
                    prev === galleryViewer.length - 1
                        ? 0
                        : prev + 1
                );
            }

            if (e.key === "ArrowRight") {
                setGalleryIndex((prev) =>
                    prev === 0
                        ? galleryViewer.length - 1
                        : prev - 1
                );
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };

    }, [galleryViewer]);


    async function loadPlanets() {
        try {
            const data = await api.getPlanetSystem();

            if (data.success) {
                console.log("PLANETS DATA:", data.planets);
                setPlanets(data.planets || []);
            }
        } catch (err) {
            console.log("planet system error", err);
        }
    }

    function isMobileView() {
        return window.innerWidth < 768;
    }

    function getNodeSize(node) {
        const isMobile = isMobileView();
        return Number(isMobile ? node.size_mobile : node.size_desktop) || 160;
    }

    function getRootPosition(node) {
        const isMobile = isMobileView();

        return {
            x: Number(isMobile ? node.x_mobile : node.x_desktop) || 0,
            y: Number(isMobile ? node.y_mobile : node.y_desktop) || 0,
        };
    }

    function getChildPosition(parentPos, child) {
        const isMobile = isMobileView();

        const radius = Number(isMobile ? child.radius_mobile : child.radius_desktop) || 180;
        const angleDeg = Number(isMobile ? child.angle_mobile : child.angle_desktop) || 0;

        const angleRad = (angleDeg * Math.PI) / 180;

        return {
            x: parentPos.x + Math.cos(angleRad) * radius,
            y: parentPos.y + Math.sin(angleRad) * radius,
        };
    }

    function getDescendantIds(node) {
        let ids = [];

        (node.children || []).forEach((child) => {
            ids.push(child.id);
            ids = ids.concat(getDescendantIds(child));
        });

        return ids;
    }

    function getAncestorIds(nodes, targetId) {
        const result = [];

        function walk(list, parents) {
            for (const item of list || []) {
                if (String(item.id) === String(targetId)) {
                    result.push(...parents.map((p) => String(p.id)));
                    return true;
                }

                if (walk(item.children || [], [...parents, item])) {
                    return true;
                }
            }

            return false;
        }

        walk(nodes || [], []);
        return result;
    }

    function findNodeById(nodes, id) {
        for (const item of nodes || []) {
            if (String(item.id) === String(id)) return item;

            const found = findNodeById(item.children || [], id);
            if (found) return found;
        }

        return null;
    }


    function toggleNode(node) {
        const hasChildren = node.children && node.children.length > 0;

        if (!hasChildren) {
            handleLeafClick(node);
            return;
        }

        setOpenNodeIds((prev) => {
            const isCurrentlyOpen = !!prev[node.id];
            const next = { ...prev };

            if (isCurrentlyOpen) {
                delete next[node.id];

                getDescendantIds(node).forEach((id) => {
                    delete next[id];
                });
            } else {
                next[node.id] = true;

                if (node.parent_id !== null && node.parent_id !== undefined) {
                    setActiveBranchId(node.id);
                }
            }


            return next;
        });
    }


    async function handleLeafClick(node) {
        if (node.page_key === "register") {

            let courseName = "";

            if (node.node_key?.includes("_register")) {
                courseName = node.node_key.replace("_register", "");
            }

            onGoConsult(courseName);

            return;
        }



        if (!node.page_key) {
            return;
        }

        setLoadingContent(true);

        try {
            const result = await api.getPageContent(node.page_key);

            if (result.success && result.item) {
                setContentModal(result.item);
            }
        } catch (err) {
            console.log(err);
        }

        setLoadingContent(false);
    }


    function renderNode(node, position, level = 0) {
        return null;
    }

    function getContentBlocks() {
        if (!contentModal?.content_blocks) return [];

        try {
            return JSON.parse(contentModal.content_blocks || "[]");
        } catch {
            return [];
        }
    }

    function isGalleryModal() {
        return contentModal?.page_key === "gallery";
    }

    function isFaqModal() {
        return (
            contentModal?.page_key?.includes("faq") ||
            contentModal?.title?.includes("پرسش")
        );
    }

    const effectiveOpenNodeIds = React.useMemo(() => {
        const next = { ...openNodeIds };

        if (!activeBranchId) return next;

        const ancestorIds = getAncestorIds(planets, activeBranchId);

        Object.keys(next).forEach((id) => {
            const node = findNodeById(planets, id);
            if (!node) return;

            const isRoot = node.parent_id === null;
            const isActive = String(id) === String(activeBranchId);
            const isAncestor = ancestorIds.includes(String(id));

            if (!isRoot && !isActive && !isAncestor) {
                delete next[id];
            }
        });

        return next;
    }, [openNodeIds, activeBranchId, planets]);


    return (
        <div className="planet-system">

            <PlanetRendererV2
                planets={planets}
                openNodeIds={effectiveOpenNodeIds}
                onNodeClick={toggleNode}
            />


            {planets.map((planet) => {
                const rootPos = getRootPosition(planet);
                return renderNode(planet, rootPos, 0);
            })}

            {contentModal &&
                ReactDOM.createPortal(
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.55)",
                            zIndex: 2147483647,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "24px",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: "relative",
                                width: "min(1200px, 96vw)",
                                height: "90vh",
                                background: "rgba(255,255,255,0.12)",
                                backdropFilter: "blur(28px)",
                                WebkitBackdropFilter: "blur(28px)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                borderRadius: "28px",
                                color: "#fff",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                                boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                            }}
                        >

                            <img
                                src="public/assets/card-watermark.png"
                                alt=""
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "10px",
                                    transform: "translate(-50%)",
                                    width: "380px",
                                    maxWidth: "60%",
                                    opacity: 0.08,
                                    pointerEvents: "none",
                                    zIndex: 0,
                                }}
                            />


                            <div
                                style={{
                                    position: "relative",
                                    zIndex: 1,
                                    flex: 1,
                                    overflowY: "auto",
                                    minHeight: 0,
                                    padding: "36px",
                                    direction: "rtl",
                                    textAlign: "right",
                                }}
                            >
                                {isGalleryModal() ? (
                                    <div>
                                        <h2
                                            style={{
                                                fontSize: "30px",
                                                marginBottom: "24px",
                                                textAlign: "center",
                                            }}
                                        >
                                            گالری تصاویر
                                        </h2>

                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                                gap: "20px",
                                            }}
                                        >
                                            {getContentBlocks()
                                                .filter((block) => block.type === "gallery_image")
                                                .map((block, index) => (
                                                    <div
                                                        key={block.id || index}
                                                        onClick={() => {
                                                            const galleryItems =
                                                                getContentBlocks().filter(
                                                                    (x) => x.type === "gallery_image"
                                                                );

                                                            setGalleryViewer(galleryItems);
                                                            setGalleryIndex(index);
                                                        }}
                                                        style={{
                                                            background: "rgba(255,255,255,0.08)",
                                                            border: "1px solid rgba(255,255,255,0.14)",
                                                            borderRadius: "20px",
                                                            overflow: "hidden",
                                                            boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
                                                        }}
                                                    >
                                                        {block.image && (
                                                            <img
                                                                src={block.image}
                                                                alt=""
                                                                style={{
                                                                    width: "100%",
                                                                    height: "260px",
                                                                    objectFit: "cover",
                                                                    display: "block",
                                                                }}
                                                            />
                                                        )}

                                                        <div style={{ padding: "16px" }}>
                                                            {block.title && (
                                                                <h3
                                                                    style={{
                                                                        margin: "0 0 8px",
                                                                        fontSize: "18px",
                                                                    }}
                                                                >
                                                                    {block.title}
                                                                </h3>
                                                            )}

                                                            {block.description && (
                                                                <p
                                                                    style={{
                                                                        margin: 0,
                                                                        lineHeight: "1.9",
                                                                        color: "rgba(255,255,255,0.82)",
                                                                        fontSize: "14px",
                                                                    }}
                                                                >
                                                                    {block.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : isFaqModal() ? (
                                    <div>
                                        <h2
                                            style={{
                                                fontSize: "30px",
                                                marginBottom: "24px",
                                                textAlign: "center",
                                            }}
                                        >
                                            پرسش‌های متداول
                                        </h2>

                                        {getContentBlocks().map((block, index) => (
                                            <div
                                                key={block.id || index}
                                                style={{
                                                    marginBottom: "12px",
                                                    borderRadius: "18px",
                                                    background: "rgba(255,255,255,0.08)",
                                                    border: "1px solid rgba(255,255,255,0.14)",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenFaqIndex(
                                                            openFaqIndex === index ? null : index
                                                        )
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        padding: "18px 20px",
                                                        background: "transparent",
                                                        border: "none",
                                                        color: "#fff",
                                                        fontWeight: "900",
                                                        fontSize: "17px",
                                                        textAlign: "right",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {openFaqIndex === index ? "▼ " : "◀ "}
                                                    {block.title || "سوال"}
                                                </button>

                                                {openFaqIndex === index && (
                                                    <div
                                                        style={{
                                                            padding: "0 20px 20px",
                                                            color: "rgba(255,255,255,0.85)",
                                                            lineHeight: "2",
                                                            whiteSpace: "pre-line",
                                                        }}
                                                    >
                                                        {block.content || ""}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (

                                    <>
                                        {getContentBlocks().map((block, index) => (
                                            <div key={block.id || index} style={{ marginBottom: "28px" }}>
                                                {block.type === "text" && (
                                                    <div>
                                                        {block.title && (
                                                            <h2 style={{ fontSize: "28px", lineHeight: "1.6" }}>
                                                                {block.title}
                                                            </h2>
                                                        )}

                                                        {block.content && (
                                                            <p
                                                                style={{
                                                                    fontSize: "17px",
                                                                    lineHeight: "2.1",
                                                                    whiteSpace: "pre-line",
                                                                }}
                                                            >
                                                                {block.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === "image" && block.url && (
                                                    <div
                                                        style={{
                                                            textAlign:
                                                                block.align === "left"
                                                                    ? "left"
                                                                    : block.align === "right"
                                                                        ? "right"
                                                                        : "center",
                                                        }}
                                                    >
                                                        <img
                                                            src={block.url}
                                                            alt=""
                                                            style={{
                                                                width: block.size === "full" ? "100%" : "auto",
                                                                maxWidth:
                                                                    block.size === "avatar"
                                                                        ? "100px"
                                                                        : block.size === "small"
                                                                            ? "350px"
                                                                            : block.size === "medium"
                                                                                ? "600px"
                                                                                : block.size === "large"
                                                                                    ? "900px"
                                                                                    : "100%",
                                                                maxHeight:
                                                                    block.size === "avatar"
                                                                        ? "100px"
                                                                        : "520px",

                                                                objectFit: "cover",
                                                                borderRadius: block.size === "avatar" ? "50%" : "24px",
                                                                boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                                                            }}
                                                        />

                                                        {block.caption && (
                                                            <div
                                                                style={{
                                                                    marginTop: "10px",
                                                                    opacity: 0.85,
                                                                    fontSize: "14px",
                                                                    fontStyle: "italic",
                                                                }}
                                                            >
                                                                {block.caption}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === "pdf" && block.url && (
                                                    <div
                                                        style={{
                                                            padding: "24px",
                                                            borderRadius: "24px",
                                                            background: "rgba(255,255,255,0.08)",
                                                            backdropFilter: "blur(18px)",
                                                            WebkitBackdropFilter: "blur(18px)",
                                                            border: "1px solid rgba(255,255,255,0.15)",
                                                            textAlign: "center",
                                                            boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
                                                        }}
                                                    >
                                                        <div style={{ fontSize: "42px", marginBottom: "12px" }}>
                                                            📄
                                                        </div>

                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontWeight: "900",
                                                                fontSize: "18px",
                                                                marginBottom: "8px",
                                                                wordBreak: "break-word",
                                                            }}
                                                        >
                                                            {block.fileName || "فایل PDF"}
                                                        </div>

                                                        <div
                                                            style={{
                                                                color: "rgba(255,255,255,0.7)",
                                                                marginBottom: "18px",
                                                            }}
                                                        >
                                                            فایل پیوست دوره
                                                        </div>

                                                        <a
                                                            href={block.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                                display: "inline-block",
                                                                background: "rgba(255,255,255,0.12)",
                                                                border: "1px solid rgba(255,255,255,0.18)",
                                                                color: "#fff",
                                                                padding: "12px 24px",
                                                                borderRadius: "14px",
                                                                textDecoration: "none",
                                                                fontWeight: "900",
                                                            }}
                                                        >
                                                            مشاهده PDF
                                                        </a>
                                                    </div>
                                                )}

                                                {block.type === "video" && block.url && (
                                                    <div
                                                        style={{
                                                            textAlign:
                                                                block.align === "left"
                                                                    ? "left"
                                                                    : block.align === "right"
                                                                        ? "right"
                                                                        : "center",
                                                        }}
                                                    >
                                                        <video
                                                            controls
                                                            src={block.url}
                                                            style={{
                                                                width: "100%",
                                                                maxWidth:
                                                                    block.size === "medium"
                                                                        ? "650px"
                                                                        : block.size === "large"
                                                                            ? "900px"
                                                                            : "100%",
                                                                maxHeight: "520px",
                                                                borderRadius: "24px",
                                                                background: "#000",
                                                                boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                                                            }}
                                                        />

                                                        {block.caption && (
                                                            <div
                                                                style={{
                                                                    marginTop: "10px",
                                                                    opacity: 0.85,
                                                                    fontSize: "14px",
                                                                    fontStyle: "italic",
                                                                }}
                                                            >
                                                                {block.caption}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>


                            <div
                                style={{
                                    padding: "16px",
                                    borderTop: "1px solid rgba(255,255,255,0.18)",
                                    textAlign: "center",
                                    background: "rgba(0,0,0,0.25)",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setContentModal(null)}
                                    style={{
                                        padding: "12px 30px",
                                        borderRadius: "16px",

                                        background: "rgba(15,23,42,.55)",
                                        backdropFilter: "blur(18px)",
                                        WebkitBackdropFilter: "blur(18px)",

                                        border: "1px solid rgba(255,255,255,.12)",

                                        color: "#ffffff",

                                        fontWeight: "900",
                                        fontSize: "15px",

                                        cursor: "pointer",

                                        boxShadow:
                                            "0 10px 24px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.05)",

                                        transition: "all .2s ease",
                                    }}
                                >
                                    بستن
                                </button>

                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {galleryViewer &&
                ReactDOM.createPortal(
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.92)",
                            zIndex: 2147483647,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "24px",
                            boxSizing: "border-box",
                        }}
                        onClick={() => setGalleryViewer(null)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: "min(1100px, 96vw)",
                                maxHeight: "92vh",
                                color: "#fff",
                                textAlign: "center",
                            }}
                        >
                            {galleryViewer[galleryIndex]?.image && (
                                <img
                                    src={galleryViewer[galleryIndex].image}
                                    alt=""
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "60vh",
                                        objectFit: "contain",
                                        borderRadius: "24px",
                                        boxShadow: "0 30px 90px rgba(0,0,0,0.65)",
                                    }}
                                />
                            )}

                            {galleryViewer[galleryIndex]?.title && (
                                <h2
                                    style={{
                                        marginTop: "12px",
                                        fontSize: "28px",
                                        fontWeight: "900",
                                    }}
                                >

                                    {galleryViewer[galleryIndex].title}
                                </h2>
                            )}

                            {galleryViewer[galleryIndex]?.description && (
                                <p
                                    style={{
                                        lineHeight: "2",
                                        color: "rgba(255,255,255,0.82)",
                                        maxWidth: "800px",
                                        margin: "12px auto",
                                        fontSize: "15px",
                                    }}
                                >

                                    {galleryViewer[galleryIndex].description}
                                </p>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "12px",
                                    marginTop: "10px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    className="btn"
                                    onClick={() =>
                                        setGalleryIndex((prev) =>
                                            prev === 0
                                                ? galleryViewer.length - 1
                                                : prev - 1
                                        )
                                    }
                                >
                                    قبلی
                                </button>

                                <button
                                    className="btn"
                                    onClick={() =>
                                        setGalleryIndex((prev) =>
                                            prev === galleryViewer.length - 1
                                                ? 0
                                                : prev + 1
                                        )
                                    }
                                >
                                    بعدی
                                </button>

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setGalleryViewer(null)}
                                >
                                    بستن
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}



        </div>

    );
}




function LoginPage({ username, password, message, setUsername, setPassword, onLogin, onHome }) {
    return (
        <div
            className="login-page"
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                margin: 0,
                padding: "20px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: '"Vazirmatn", "Inter", Tahoma, Arial, sans-serif',
                backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('public/assets/home-bg.png')",

                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <form
                className="login-card"
                onSubmit={onLogin}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "430px",
                    boxSizing: "border-box",
                    padding: "32px",
                    borderRadius: "32px",
                    textAlign: "center",

                    background: "rgba(255,255,255,0.10)",

                    backdropFilter: "blur(28px)",
                    WebkitBackdropFilter: "blur(28px)",

                    border: "1px solid rgba(255,255,255,0.35)",

                    boxShadow:
                        "0 15px 45px rgba(0,0,0,0.30), 0 0 30px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}


            >
                <img
                    src="public/assets/nil-logo-white.png"
                    alt="NIL"
                    style={{
                        width: "110px",
                        height: "auto",
                        marginBottom: "14px",
                    }}
                />
                <button
                    type="button"
                    onClick={onHome}
                    style={{
                        position: "absolute",
                        top: "18px",
                        right: "18px",

                        width: "40px",
                        height: "40px",

                        borderRadius: "12px",

                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.25)",

                        color: "#ffffff",
                        fontSize: "18px",
                        fontWeight: "900",

                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    ←
                </button>





                <div style={{ position: "relative", marginBottom: "12px" }}>
                    <span
                        style={{
                            position: "absolute",
                            right: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "18px",
                            color: "#64748b",
                            zIndex: 2,
                        }}
                    >
                        👤
                    </span>

                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="نام کاربری"
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "14px 46px 14px 16px",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.28)",
                            background: "rgba(255,255,255,0.18)",
                            color: "#ffffff",
                            fontFamily: "inherit",
                        }}
                    />
                </div>



                <div style={{ position: "relative", marginBottom: "18px" }}>
                    <span
                        style={{
                            position: "absolute",
                            right: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "18px",
                            color: "#64748b",
                            zIndex: 2,
                        }}
                    >
                        🔒
                    </span>

                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور"
                        type="password"
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "14px 46px 14px 16px",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.28)",
                            background: "rgba(255,255,255,0.18)",
                            color: "#ffffff",
                            fontFamily: "inherit",
                        }}
                    />
                </div>



                <button
                    className="btn"
                    type="submit"
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        borderRadius: "16px",
                        padding: "14px",
                        fontSize: "15px",
                        fontWeight: "900",
                        fontFamily: "inherit",
                        background: "#ffffff",
                        color: "#4f46e5",
                        boxShadow: "0 14px 30px rgba(255,255,255,0.22)",
                        border: "none",
                    }}
                >
                    ورود
                </button>

                {message && (
                    <div
                        style={{
                            marginTop: "16px",
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            borderRadius: "14px",
                            padding: "10px",
                            fontWeight: "800",
                            fontSize: "13px",
                        }}
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}



function DashboardPage({ user, onLogout, onHome, onGoCourses, onGoProfile }) {
    return (
        <div className="page">
            <Header user={user} onLogout={onLogout} onHome={onHome} onProfile={onGoProfile} />

            <h1>پنل شرکت‌کننده</h1>

            <div className="course-card" style={{ maxWidth: "420px" }}>
                <h2>پروفایل</h2>
                <p>نام: {user.full_name}</p>
                <p>نام کاربری: {user.username}</p>
                <p>نقش: شرکت‌کننده</p>
            </div>

            <h2 className="section-title">دسترسی‌ها</h2>

            <button className="btn" onClick={onGoCourses}>
                دوره‌های من
            </button>
        </div>
    );
}



function HomePage({ user, onGoLogin, onGoDashboard, onGoCourses, onGoConsult, onHome, onGoProfile }) {
    const isGuest = !user;
    return (
        <div className="page home-page">
            <div className="mobile-stars">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            <Header
                user={user}
                onLogout={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
                onHome={onHome}
                onProfile={onGoProfile}
                onDashboard={onGoDashboard}
                showHomeButton={false}
                showAccountEditButton={true}
            />

            <div className="home-actions">
                {!user && (
                    <button
                        className="btn"
                        onClick={onGoLogin}
                    >
                        ورود
                    </button>
                )}


                {/* {!user && (
                    <button
                        className="btn"
                        onClick={() => onGoConsult("")}
                    >
                        ثبت‌نام و درخواست مشاوره
                    </button>
                )} */}
            </div>

            <PlanetSystem
                onGoConsult={onGoConsult} />


        </div>
    );
}

