const vs = `
    struct Uniforms {
        matrix: mat4x4f,
    };
    struct VSOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) color: vec4<f32>,
    };

    @group(0) @binding(0) var<uniform> uni: Uniforms;

    @vertex
    fn main(@location(0) pos: vec4<f32>) -> VSOutput {
        var vsOut: VSOutput;

        // test projection, model, view matrix
        var proj = mat4x4<f32>(
            1.1618949174880981,
            -0.3162277638912201,
            -0.4090656042098999,
            -0.40824830532073975,
            -0.5459120273590088,
            -0.0535324364900589,
            -0.9087005257606506,
            -0.9068849682807922,
            -0.19869573414325714,
            -1.7020970582962036,
            0.10457856953144073,
            0.1043696179986,
            0,
            3.845925303739569e-16,
            4.708587169647217,
            4.898979663848877
        );

        // vsOut.position = proj * pos;
        vsOut.position = uni.matrix * pos;
        vsOut.color = vec4(pos.y / 200.0);

        return vsOut;
    }
`;
const fs = `
    struct FSInput {
        @builtin(position) position: vec4<f32>,
        @location(0) color: vec4<f32>,
    };

    @fragment
    fn main(fsInput: FSInput) -> @location(0) vec4f {
        return fsInput.color;
    }
`;

export default {
    vertexShader: vs,
    fragmentShader: fs
}