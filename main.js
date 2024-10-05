(function() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl2');
  
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
  
    function resizeCanvasToDisplaySize(canvas) {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
  
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
    }
  
    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
  
    const fragmentShaderSource = `
      precision highp float;
  
      uniform float iTime;
      uniform vec2 iResolution;
  
      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.5 - iResolution.xy) / iResolution.y;
        vec2 uv0 = uv;
        vec3 finalColor = vec3(0.0);
  
        for (float i = 0.0; i < 1.0; i++) {
          uv = uv * 3.33 - 3.33;
  
          float d = length(uv) * exp(-length(uv0));
  
          vec3 col = vec3(0.2, 0.3, 0.9) +
                     vec3(0.9, 0.9, 0.0) * cos(3.2 * (vec3(1.0) * (length(uv0) + i * 0.4 + iTime * 0.2) + vec3(0.263, 0.416, 0.557)));
  
          d = sin(d * 33.333 + iTime / 0.5) / 10.0;
          d = abs(d);
  
          d = pow(0.03 / d, 0.1);
  
          finalColor += col * d;
        }
  
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
  
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }
  
      console.error('Shader compile failed with: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }
  
    function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }
  
      console.error('Program failed to link: ' + gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }
  
    // Compile shaders and create program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
  
    // Look up attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
    const iTimeUniformLocation = gl.getUniformLocation(program, "iTime");
    const iResolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
  
    // Create a buffer for the positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Full-screen quad
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    // Set up the vertex array
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  
    function render(time) {
      resizeCanvasToDisplaySize(gl.canvas);
  
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      gl.useProgram(program);
      gl.bindVertexArray(vao);
  
      // Convert time from milliseconds to seconds
      let seconds = time * 0.001;
  
      // Set uniforms
      gl.uniform1f(iTimeUniformLocation, seconds);
      gl.uniform2f(iResolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  
      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);
  
      // Loop the animation
      requestAnimationFrame(render);
    }
  
    // Start the animation loop
    requestAnimationFrame(render);
  
  })();
  