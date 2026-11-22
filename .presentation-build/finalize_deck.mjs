import path from 'node:path';
process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
import { pathToFileURL } from 'node:url';
const skillDir='C:/Users/santo/.codex/plugins/cache/openai-primary-runtime/presentations/26.1118.11504/skills/presentations';
const workspaceDir='D:/GearFlow';
const candidatePath='D:/GearFlow/.presentation-build/GearFlow_DevOps_Architecture_Draft.pptx';
const finalPath='D:/GearFlow/output/presentations/GearFlow_DevOps_Architecture_Validated.pptx';
const stagingDir='D:/GearFlow/.presentation-build/finalizer';
const {finalizePresentation}=await import(pathToFileURL(path.join(skillDir,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({
 workspaceDir,candidatePath,finalPath,
 pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],
 explicitTotalSlideCount:10,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
 fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,
 receiptPath:path.join(stagingDir,'GearFlow_DevOps_Architecture.validation.json'),
});
console.log(JSON.stringify(result));


