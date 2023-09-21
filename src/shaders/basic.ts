const vs = `
    struct VSOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) color: vec4<f32>,
    };

    @vertex
    fn main(@location(0) pos: vec4<f32>) -> VSOutput {
        var vsOut: VSOutput;
        vsOut.position = pos;
        vsOut.color = vec4(1.0, 0.0, 0.0, 1.0);
        return vsOut;
    }
`;
const fs = `
    struct FSInput {
        @builtin(position) position: vec4<f32>,
        @location(0) color: vec4<f32>,
    };

    @fragment
    fn main(vsOut: FSInput) -> @location(0) vec4f {
        return vsOut.color;
    }
`;

export default {
    vertexShader: vs,
    fragmentShader: fs
}