import type { ReactElement, ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { RandomNumber } from "~/components/RandomNumber";
import { randomDefaults } from "~/config/constants";
import reactLogo from "./react.svg"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { CFDModelRenderer } from "../ModelRender/render_cfd_model";
import type { CFDModelRendererHandle } from "../ModelRender/render_cfd_model";

export function App(): ReactElement {
    const rendererRef = useRef<CFDModelRendererHandle | null>(null);
    const [urlToRender, setUrlToRender] = useState<string | undefined>("/models/example.glb");
    const [fileToRender, setFileToRender] = useState<File | undefined>(undefined);

    useEffect(() => {
        // upload initial model in background (doesn't affect rendering)
        // void loadCFDModelAndStore("/models/example.glb").catch((err) => {
        //     console.warn("upload failed", err);
        // });
    }, []);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (!file) return;

        // render directly from the File (CFDModelRenderer accepts `file`)
        setFileToRender(file);

        // // upload in background
        // void loadCFDModelAndStore(file).catch((err) => {
        //     console.warn("upload failed", err);
        // });

        // clear input so same file can be reselected
        e.currentTarget.value = "";
    };

    const onCapture = () => {
        const dataUrl = rendererRef.current?.captureImage();
        if (dataUrl) {
            // open preview in new tab
            const w = window.open();
            if (w) w.document.write(`<img src="${dataUrl}" />`);
        }
    };

    const onResetView = () => {
        rendererRef.current?.setView({ position: [0, 2, 5], target: [0, 0, 0], fov: 45 });
    };

    return (
        <>
            {/* <div className="center">
                <img src={reactLogo} alt="React Logo" />
                <br />
                Hello World <RandomNumber min={randomDefaults.MIN} max={randomDefaults.MAX} />
            </div> */}

            <div className="center" style={{ marginTop: 12 }}>
                <label htmlFor="cfd-upload" style={{ display: "block", marginBottom: 8 }}>
                    Upload a CFD model (.glb):
                </label>
                <input id="cfd-upload" type="file" accept=".glb,model/gltf-binary" onChange={handleFileChange} />
            </div>

            <div className="center" style={{ marginTop: 16 }}>
                <button onClick={onResetView}>Reset View</button>
                <button onClick={onCapture} style={{ marginLeft: 8 }}>
                    Capture Image
                </button>
            </div>

            <div className="center" style={{ marginTop: 16 }}>
                {/* prefer passing file when user uploaded; otherwise use url */}
                <CFDModelRenderer ref={rendererRef} url={fileToRender ? undefined : urlToRender} file={fileToRender} />
            </div>
        </>
    );
}
