import { Profiler } from '../../instrument';
import { TextureLayoutStrategy } from './texture-layout-strategy';
import { Artifact, ProgramInfo, ProgramVariable, TextureData, TextureLayout, VariableInfo } from './types';
import { WebGLContext } from './webgl-context';
/**
 * ProgramManager is the main class behind running computations
 * It builds ProgramInfo's into Artifacts
 * It compiles given ProgramInfo's into WebGL Prorams (cached as Artifacts)
 * Uses the artifact to run the computation by calling Draw on
 * the WebGL drawing buffer
 * ProgramManager automatically maps (binds) input variables to their
 * corresponding Location's in the binary program
 */
export declare class ProgramManager {
    profiler: Readonly<Profiler>;
    glContext: WebGLContext;
    textureLayoutStrategy: TextureLayoutStrategy;
    repo: Map<unknown, Artifact>;
    vertexShader: WebGLShader;
    attributesBound: boolean;
    constructor(profiler: Readonly<Profiler>, glContext: WebGLContext, textureLayoutStrategy: TextureLayoutStrategy);
    getArtifact(key: unknown): Artifact | undefined;
    setArtifact(key: unknown, artifact: Artifact): void;
    run(buildArtifact: Artifact, inputs: TextureData[], output: TextureData): void;
    dispose(): void;
    build(programInfo: ProgramInfo, inputTextureLayouts: TextureLayout[], outputTextureLayout: TextureLayout): Artifact;
    protected compile(fragShaderScript: string): WebGLProgram;
    bindOutput(td: TextureData): void;
    bindAttributes(attribLocations: Artifact.AttribLocations): void;
    bindUniforms(uniformLocations: Artifact.UniformLocations, variables: ProgramVariable[], textures: TextureData[]): void;
    bindTexture(td: TextureData, uniformHandle: WebGLUniformLocation, position: number): void;
    getAttribLocations(program: WebGLProgram): Artifact.AttribLocations;
    getUniformLocations(program: WebGLProgram, samplers?: string[], variables?: VariableInfo[]): Artifact.UniformLocations;
    getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation;
    getAttribLocation(program: WebGLProgram, name: string): number;
}
