function PlanetRendererV2({
    planets,
    openNodeIds,
    onNodeClick
}) {
    const containerRef = React.useRef(null);
    const rendererRef = React.useRef(null);
    const sceneRef = React.useRef(null);
    const cameraRef = React.useRef(null);
    const animationRef = React.useRef(null);
    const raycasterRef = React.useRef(new THREE.Raycaster());
    const mouseRef = React.useRef(new THREE.Vector2());
    const textureCacheRef = React.useRef({});
    const [closingPlanets, setClosingPlanets] = React.useState([]);
    const [hoveredNodeId, setHoveredNodeId] = React.useState(null);

    function isMobileView() {
        return (
            window.innerWidth <= 900 ||
            window.screen.width <= 900 ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        );
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

    function buildVisiblePlanets() {
        const result = [];

        function walk(node, position) {
            result.push({
                ...node,
                _renderX: position.x,
                _renderY: position.y,
            });

            const isOpen =
                !!openNodeIds?.[node.id] ||
                !!openNodeIds?.[String(node.id)] ||
                !!openNodeIds?.[Number(node.id)];

            const children = node.children || [];

            if (isOpen) {
                children.forEach((child) => {
                    const childPos = getChildPosition(position, child);
                    walk(child, childPos);
                });
            }
        }

        (planets || []).forEach((planet) => {
            const rootPos = getRootPosition(planet);
            walk(planet, rootPos);
        });

        return result;
    }


    React.useEffect(() => {

        if (!containerRef.current || rendererRef.current) return;


        const container = containerRef.current;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.OrthographicCamera(
            -container.clientWidth / 2,
            container.clientWidth / 2,
            container.clientHeight / 2,
            -container.clientHeight / 2,
            0.1,
            5000
        );

        camera.position.set(0, 0, 1000);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });

        if (THREE.SRGBColorSpace) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        }

        if (THREE.NoToneMapping) {
            renderer.toneMapping = THREE.NoToneMapping;
        }

        renderer.toneMappingExposure = 1;


        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );

        renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        function resizeRenderer() {
            const width = container.clientWidth;
            const height = container.clientHeight;

            renderer.setSize(width, height);

            renderer.domElement.style.width = "100%";
            renderer.domElement.style.height = "100%";

            camera.left = -width / 2;
            camera.right = width / 2;
            camera.top = height / 2;
            camera.bottom = -height / 2;

            camera.updateProjectionMatrix();
        }



        resizeRenderer();

        window.addEventListener("resize", resizeRenderer);


        container.appendChild(renderer.domElement);

        renderer.domElement.style.pointerEvents = "auto";

        renderer.domElement.style.webkitTapHighlightColor = "transparent";
        renderer.domElement.style.outline = "none";
        renderer.domElement.style.userSelect = "none";
        renderer.domElement.style.webkitUserSelect = "none";
        renderer.domElement.style.touchAction = "manipulation";

        renderer.domElement.addEventListener(
            "click",
            handlePointer
        );

        renderer.domElement.addEventListener(
            "mousemove",
            handlePointerMove
        );

        rendererRef.current = renderer;

        function animate() {
            animationRef.current = requestAnimationFrame(animate);

            scene.children.forEach((obj) => {
                if (obj.userData?.planetMesh) {
                    obj.rotation.y +=
                        (obj.userData.speed || 0.006) *
                        (obj.userData.direction || 1);

                    if (!obj.userData.birth && !obj.userData.closing) {
                        const floatAmount = 4;
                        const floatSpeed = 0.0018;
                        const seed = Number(obj.userData.node?.id || 1) * 0.7;

                        obj.position.y =
                            obj.userData.baseY +
                            Math.sin(performance.now() * floatSpeed + seed) * floatAmount;
                    }



                    if (obj.userData.birth) {
                        const duration = 650;
                        const t = Math.min(
                            (performance.now() - obj.userData.birth) / duration,
                            1
                        );

                        const ease = 1 - Math.pow(1 - t, 3);
                        const bounce = Math.sin(t * Math.PI) * 8;

                        obj.position.x = obj.userData.baseX;
                        obj.position.y = obj.userData.baseY - 24 * (1 - ease) + bounce;
                        obj.position.z = obj.userData.baseZ;

                        const scale = 0.72 + 0.28 * ease + Math.sin(t * Math.PI) * 0.05;
                        const planetScale = obj.userData.planetScale || 1;

                        obj.scale.set(
                            planetScale * scale,
                            planetScale * scale,
                            planetScale * scale
                        );



                        if (t >= 1) {
                            obj.position.y = obj.userData.baseY;

                            const planetScale = obj.userData.planetScale || 1;

                            obj.scale.set(
                                planetScale,
                                planetScale,
                                planetScale
                            );
                            delete obj.userData.birth;
                        }
                    }

                    if (obj.userData.closing) {
                        const duration = 520;
                        const t = Math.min(
                            (performance.now() - obj.userData.closing) / duration,
                            1
                        );

                        const ease = 1 - Math.pow(1 - t, 3);

                        obj.position.x = obj.userData.baseX;
                        obj.position.y = obj.userData.baseY - 18 * ease;
                        obj.position.z = obj.userData.baseZ;

                        const scale = 1 - 0.28 * ease;
                        const planetScale = obj.userData.planetScale || 1;

                        obj.scale.set(
                            planetScale * scale,
                            planetScale * scale,
                            planetScale * scale
                        );




                        if (obj.material) {
                            obj.material.opacity = 1 - ease;
                            obj.material.transparent = true;
                            obj.material.needsUpdate = true;
                        }
                    }


                }
            });

            renderer.render(scene, camera);
        }

        animate();

        return () => {

            cancelAnimationFrame(animationRef.current);

            renderer.domElement.removeEventListener(
                "click",
                handlePointer
            );

            renderer.domElement.removeEventListener(
                "mousemove",
                handlePointerMove
            );

            window.removeEventListener("resize", resizeRenderer);


            renderer.dispose();

            container.innerHTML = "";

            rendererRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;

        };

    }, []);

    const visiblePlanets = React.useMemo(() => {
        return buildVisiblePlanets();
    }, [planets, openNodeIds]);

    const renderPlanets = React.useMemo(() => {
        const map = new Map();

        visiblePlanets.forEach((p) => {
            map.set(String(p.id), p);
        });

        closingPlanets.forEach((p) => {
            if (!map.has(String(p.id))) {
                map.set(String(p.id), p);
            }
        });

        return Array.from(map.values());
    }, [visiblePlanets, closingPlanets]);

    React.useEffect(() => {
        if (!sceneRef.current) return;

        const currentIds = new Set(
            visiblePlanets.map((p) => String(p.id))
        );

        const removed = sceneRef.current.children
            .filter((obj) => obj.userData?.planetMesh)
            .map((obj) => obj.userData.node)
            .filter((node) => node && !currentIds.has(String(node.id)))
            .map((node) => ({
                ...node,
                _closing: true,
            }));

        if (!removed.length) return;

        setClosingPlanets(removed);

        const timer = setTimeout(() => {
            setClosingPlanets([]);
        }, 520);

        return () => clearTimeout(timer);
    }, [visiblePlanets]);






    React.useEffect(() => {
        if (!sceneRef.current || !window.THREE) return;

        const scene = sceneRef.current;

        const previousIds = new Set(
            scene.children
                .filter((obj) => obj.userData?.planetMesh)
                .map((obj) => String(obj.userData?.node?.id))
        );


        scene.children = scene.children.filter((obj) => {
            if (obj.userData?.planetMesh) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material?.map) obj.material.map.dispose();
                if (obj.material) obj.material.dispose();
                return false;
            }

            return true;
        });

        if (!renderPlanets.length) return;

        renderPlanets.forEach((node) => {
            const isMobile = isMobileView();

            const size =
                Number(isMobile ? node.size_mobile : node.size_desktop) || 180;

            const geometry = new THREE.SphereGeometry(1, 64, 64);

            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0,
            });



            const sphere = new THREE.Mesh(geometry, material);

            const planetScale = size / 2;
            sphere.userData.planetScale = planetScale;




            sphere.userData.planetMesh = true;
            sphere.userData.node = node;

            sphere.userData.speed =
                Number(
                    (window.innerWidth < 768
                        ? node.speed_mobile
                        : node.speed_desktop)
                ) || 0.006;

            sphere.userData.direction =
                node.direction === "left" ? -1 : 1;


            const isNewPlanet = !previousIds.has(String(node.id));

            const isClosing = !!node._closing;


            sphere.userData.baseX = node._renderX;
            sphere.userData.baseY = -node._renderY;
            sphere.userData.baseZ = 0;

            if (isClosing) {
                sphere.userData.closing = performance.now();
                sphere.position.set(node._renderX, -node._renderY, 0);
                sphere.scale.set(planetScale, planetScale, planetScale);


            } else if (isNewPlanet) {
                sphere.userData.birth = performance.now();
                sphere.position.set(node._renderX, -node._renderY - 24, 0);
                sphere.scale.set(
                    planetScale * 0.72,
                    planetScale * 0.72,
                    planetScale * 0.72
                );

            } else {
                sphere.position.set(node._renderX, -node._renderY, 0);
                sphere.scale.set(planetScale, planetScale, planetScale);


            }



            scene.add(sphere);







            if (node.texture_path) {
                const cachedTexture = textureCacheRef.current[node.texture_path];

                if (cachedTexture) {
                    material.map = cachedTexture;
                    material.opacity = 1;
                    material.needsUpdate = true;
                } else {
                    const loader = new THREE.TextureLoader();
                    loader.setCrossOrigin("anonymous");

                    loader.load(node.texture_path, (texture) => {
                        if (THREE.SRGBColorSpace) {
                            texture.colorSpace = THREE.SRGBColorSpace;
                        } else if (THREE.sRGBEncoding) {
                            texture.encoding = THREE.sRGBEncoding;
                        }

                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(1, 1);


                        textureCacheRef.current[node.texture_path] = texture;

                        material.map = texture;
                        material.opacity = 1;
                        material.needsUpdate = true;
                    });
                }
            } else {
                material.opacity = 1;
            }

        });

    }, [renderPlanets]);


    function handlePointer(event) {

        if (!rendererRef.current || !cameraRef.current || !sceneRef.current) {
            return;
        }

        const rect =
            rendererRef.current.domElement.getBoundingClientRect();

        mouseRef.current.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        mouseRef.current.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(
            mouseRef.current,
            cameraRef.current
        );

        const hits =
            raycasterRef.current.intersectObjects(
                sceneRef.current.children,
                true
            );



        if (!hits.length) return;

        const node = hits[0].object.userData?.node;

        if (!node) return;

        if (typeof onNodeClick === "function") {
            onNodeClick(node);
        }

    }

    function handlePointerMove(event) {

        if (!rendererRef.current || !cameraRef.current || !sceneRef.current) {
            return;
        }

        const rect =
            rendererRef.current.domElement.getBoundingClientRect();

        mouseRef.current.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        mouseRef.current.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(
            mouseRef.current,
            cameraRef.current
        );

        const hits =
            raycasterRef.current.intersectObjects(
                sceneRef.current.children,
                true
            );

        if (hits.length) {
            const node = hits[0].object.userData?.node;
            setHoveredNodeId(node?.id || null);
        } else {
            setHoveredNodeId(null);
        }


        rendererRef.current.domElement.style.cursor =
            hits.length ? "pointer" : "default";


    }

    function worldToScreen(x, y, z = 0) {
        if (!cameraRef.current || !containerRef.current) return null;

        const vector = new THREE.Vector3(x, y, z);
        vector.project(cameraRef.current);

        const container = containerRef.current;

        return {
            x: (vector.x * 0.5 + 0.5) * container.clientWidth,
            y: (-vector.y * 0.5 + 0.5) * container.clientHeight,
        };
    }

    function getPixelRadius(size, z = 0) {
        return size / 2;
    }








    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 50,
            }}
        >
            <div
                ref={containerRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    overflow: "hidden",
                    zIndex: 50,
                }}
            />

            {visiblePlanets.map((node) => {
                const isMobile = isMobileView();

                const size =
                    Number(isMobile ? node.size_mobile : node.size_desktop) || 180;

                const screen = worldToScreen(
                    node._renderX,
                    -node._renderY,
                    0
                );

                if (!screen) return null;

                const pixelRadius = getPixelRadius(size, 0);

                const isHovered = Number(hoveredNodeId) === Number(node.id);




                return (
                    <React.Fragment key={`v2-planet-ui-${node.id}`}>
                        <div
                            style={{
                                position: "absolute",
                                left: `${screen.x}px`,
                                top: `${screen.y}px`,
                                width: `${pixelRadius * 1.9}px`,
                                height: `${pixelRadius * 1.9}px`,
                                transform: "translate(-50%, -50%)",
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.22)",
                                filter: "blur(18px)",
                                opacity: isHovered ? 1 : 0,
                                transition: "opacity 0.25s ease",
                                pointerEvents: "none",
                                zIndex: 1,
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                left: `${screen.x}px`,
                                top: `${screen.y + pixelRadius + 12}px`,
                                transform: "translateX(-50%)",
                                color: "#ffffff",
                                fontWeight: "900",
                                fontSize: "12px",
                                textShadow: "0 2px 10px rgba(0,0,0,0.85)",
                                whiteSpace: "nowrap",
                                zIndex: 2,
                                pointerEvents: "none",
                            }}
                        >
                            {node.title}
                        </div>
                    </React.Fragment>
                );

            })}

        </div>
    );

}

window.PlanetRendererV2 = PlanetRendererV2;
