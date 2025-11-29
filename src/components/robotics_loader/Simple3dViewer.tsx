import { OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { memo, useCallback, useState } from "react";
import { Card, Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import * as THREE from "three";
import FileUploader from "./FileUploader";


/*                               TYPE DEFINITIONS                              */

export type ModelObject = THREE.Object3D;

/**
 * SceneManager
 * - Handles all 3D rendering objects
 * - Memoized to avoid rerenders unless 'models' changes
 */
const SceneManager = memo(function SceneManager({
  models,
}: {
  models: ModelObject[];
}) {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 15, 8]} intensity={1} castShadow />

      {/* Helpers */}
      <gridHelper args={[12, 12]} />
      <axesHelper args={[3]} />

      {/* Render all models */}
      {models.map((model, index) => (
        <primitive key={index} object={model} dispose={null} />
      ))}
    </>
  );
});


const Simple3DViewer: React.FC = () => {
  const [models, setModels] = useState<ModelObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Move / Rotate / Scale
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");

  /**
   * Triggered by FileUploader when upload starts
   */
  const handleModelLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  /**
   * Triggered when model is fully loaded and parsed
   */
  const handleModelLoaded = useCallback((model: ModelObject) => {
    setIsLoading(false);
    setModels([model]);
  }, []);

  return (
    <Container fluid className="simple-viewer py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card bg="dark" text="white">
            <Card.Body className="text-center">
              <Card.Title as="h1" className="fw-bold">
                3D Model Viewer
              </Card.Title>
              <Card.Text className="opacity-75">
                Upload STL/XACRO/3D Robot Models • Real-time Viewer •
                Transform Controls
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Left Panel */}
        <Col md={4} lg={3}>
          <Tabs defaultActiveKey="models" className="mb-3">
            <Tab eventKey="models" title="3D Models">
              <FileUploader
                onModelLoading={handleModelLoading}
                onModelLoaded={handleModelLoaded}
              />
            </Tab>
          </Tabs>

          {/* Transform Buttons */}
          {models.length > 0 && (
            <Card className="mt-3">
              <Card.Body>
                <h6 className="fw-bold mb-3">Transform Controls</h6>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className={`btn btn-sm ${
                      transformMode === "translate"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setTransformMode("translate")}
                  >
                    Move
                  </button>

                  <button
                    className={`btn btn-sm ${
                      transformMode === "rotate"
                        ? "btn-success"
                        : "btn-outline-success"
                    }`}
                    onClick={() => setTransformMode("rotate")}
                  >
                    Rotate
                  </button>

                  <button
                    className={`btn btn-sm ${
                      transformMode === "scale"
                        ? "btn-warning"
                        : "btn-outline-warning"
                    }`}
                    onClick={() => setTransformMode("scale")}
                  >
                    Scale
                  </button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Panel - 3D Canvas */}
        <Col md={8} lg={9}>
          <Card>
            <Card.Body className="p-0 position-relative">
              {/* Loading Overlay */}
              {isLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backdropFilter: "blur(4px)",
                    background: "rgba(0,0,0,0.4)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <div className="loader-spinner" />
                </div>
              )}

              <div className="viewport" style={{ height: "600px" }}>
                <Canvas
                  shadows
                  gl={{ antialias: true }}
                  camera={{ position: [6, 6, 6], fov: 55 }}
                >
                  {/* Background */}
                  <color attach="background" args={["#0A0F29"]} />

                  {/* Scene objects */}
                  <SceneManager models={models} />

                  {/* Transform Controls */}
                  {models[0] && (
                    <TransformControls
                      object={models[0]}
                      mode={transformMode}
                      onMouseDown={() =>
                        (document.body.style.pointerEvents = "none")
                      }
                      onMouseUp={() =>
                        (document.body.style.pointerEvents = "auto")
                      }
                    />
                  )}

                  {/* Orbit Controls */}
                  <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    rotateSpeed={0.8}
                    zoomSpeed={0.6}
                    maxDistance={50}
                    minDistance={1}
                    makeDefault
                  />
                </Canvas>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Simple3DViewer;
