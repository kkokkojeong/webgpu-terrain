import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'
import * as createCamera  from '3d-view-controls';

export default {
    define: {
      'global': {},
    },
    optimizeDeps:{
    esbuildOptions:{
      plugins:[
        esbuildCommonjs(['createCamera']) 
      ]
    }
  }
}
