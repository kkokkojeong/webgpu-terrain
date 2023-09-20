/**
 * From binary file to Json file.
 */
import * as fs from 'fs';

const FILE_NAME = "./heightmap.bin";

/**
 * 노드에서 바이너리 파일이 안 읽힘..?
 */
fs.open(FILE_NAME, 'r', (status, fd) => {
    if (status) {
        console.log(status);
        return;
    }

    const stats = fs.statSync(FILE_NAME);
    const { size } = stats;

    const terrainSize = Math.sqrt(size / 4); // fileSize / sizeof(float) 4 bytes

    console.log("file Size : ", size, size / 4);
    console.log("terrain Size : ", terrainSize, " * ", terrainSize);

    const buffer = Buffer.alloc(size);

    fs.read(fd, buffer, 0, size, 0, function(err, bytesRead) {
        console.log(buffer.toString(undefined, 0, 4));

        fs.close(fd);
    });
});

// c로 짰을 경우 제대로 열림..
//

// #include <iostream>
// #include <fstream>

// int main () 
// {
//     FILE* f;
//     f = fopen("/Users/user/Downloads/heightmap.save", "rb");

//     std::cout << "start file open" << std::endl;

//     const int size = 264196;
//     const int dataLength =  size / sizeof(float);
//     const int terrainSize = (int)sqrt(dataLength);

//     char* p = (char*)malloc(size);

//     fread(p, 1, size, f);

//     std::cout << size << std::endl;
//     std::cout << dataLength << std::endl;
//     std::cout << terrainSize << std::endl;

//     float *ptr = (float*)p;

//     for (int i = 0; i < dataLength; i++)
//     {
//         // int index = i * 4;
//         std::cout  << *(&ptr[i]) << std::endl;
//     }

//     std::cout << *(&ptr[0]) << std::endl;
//     std::cout << *(&ptr[1]) << std::endl;
//     std::cout << *(&ptr[100]) << std::endl;

//     fclose(f);

//     std::cout << "start file end" << std::endl;
// }
