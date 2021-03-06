import * as glm from 'gl-matrix'

import Camera from './../../camera'
import Shader from './../../shader'
import vsSource from './../02 Basic Lighting/basic_lighting.vs'
import fsSource from './materials.fs'
import lampVsSource from './../01 Colors/lamp.vs'
import lampFsSource from './../01 Colors/lamp.fs'


async function init() {
  document.body.style.margin = 0
  document.body.style.overflow = 'hidden'
  let canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  // camera
  let camera = new Camera(glm.vec3.fromValues(0.0, 0.0, 5.0))

  // timting
  let deltaTime = 0
  let lastFrame = 0

  // lighting
  let lightPos = glm.vec3.fromValues(1.2, 1.0, 2.0)

  // resize window
  window.onresize = function () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    drawScene()
  }

  //capture keyboard input
  let currentlyPressedKeys = {}


  //capture cursor
  canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock
  document.exitPointerLock = document.exitPointerLock ||
    document.mozExitPointerLock
  canvas.onclick = function () {
    canvas.requestPointerLock()
  }

  document.addEventListener('pointerlockchange', handleLockChange, false)
  document.addEventListener('mozpointerlockchange', handleLockChange, false)

  function handleLockChange() {
    if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas) {
      console.log('The pointer lock status is now locked')
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)
      document.addEventListener('mousemove', mouse_callback)
      document.addEventListener('wheel', wheel_callback)
    } else {
      console.log('The pointer lock status is now unlocked')
      document.removeEventListener('mousemove', mouse_callback)
      document.removeEventListener('wheel', wheel_callback)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }

  function handleKeyDown(event) {
    currentlyPressedKeys[event.key] = true
  }
  function handleKeyUp(event) {
    currentlyPressedKeys[event.key] = false
  }


  let gl = canvas.getContext('webgl')
  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser or machine may not support it.')
    return
  }
  gl.enable(gl.DEPTH_TEST)

  let shader = new Shader(gl, vsSource, fsSource)
  let lampShader = new Shader(gl, lampVsSource, lampFsSource)

  let vertices = [
    -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
    0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
    0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
    0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
    -0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
    -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,

    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
    0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
    -0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,

    -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,
    -0.5, 0.5, -0.5, -1.0, 0.0, 0.0,
    -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
    -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
    -0.5, -0.5, 0.5, -1.0, 0.0, 0.0,
    -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,

    0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
    0.5, 0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, 0.5, 1.0, 0.0, 0.0,
    0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

    -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
    0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
    0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
    0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
    -0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
    -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,

    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
    -0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0
  ]

  let VBO = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  let aVertexPosition = gl.getAttribLocation(shader.Program, 'aPos')
  gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, true, 24, 0)
  gl.enableVertexAttribArray(aVertexPosition)

  let aNormal = gl.getAttribLocation(shader.Program, 'aNormal')
  gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, true, 24, 12)
  gl.enableVertexAttribArray(aNormal)

  animate()

  function drawScene(timeStamp) {
    gl.clearColor(0.1, 0.1, 0.1, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    shader.use()
    shader.setVec3('light.position', lightPos)
    shader.setVec3('viewPos', camera.position)

    // light properties
    let lightColor = glm.vec3.create()

    lightColor[0] = Math.sin(timeStamp * 0.001)
    lightColor[1] = Math.sin(timeStamp * 0.0003)
    lightColor[2] = Math.sin(timeStamp * 0.0006)
    let diffuseColor = glm.vec3.create()
    glm.vec3.mul(diffuseColor, lightColor, glm.vec3.fromValues(0.5, 0.5, 0.5))
    let ambientColor = glm.vec3.create()
    glm.vec3.mul(ambientColor, lightColor, glm.vec3.fromValues(0.2, 0.2, 0.2))
    shader.setVec3('light.ambient', ambientColor)
    shader.setVec3('light.diffuse', diffuseColor)
    shader.setVec3('light.specular', glm.vec3.fromValues(1.0, 1.0, 1.0))

    // material properties
    shader.setVec3('material.ambient', glm.vec3.fromValues(1.0, 0.5, 0.3))
    shader.setVec3('material.diffuse', glm.vec3.fromValues(1.0, 0.5, 0.3))
    shader.setVec3('material.specular', glm.vec3.fromValues(0.5, 0.5, 0.5))
    shader.setFloat('material.shininess', 32.0)

    let view = camera.getViewMatrix()
    shader.setMat4('view', view)

    let projection = glm.mat4.create()
    glm.mat4.perspective(projection, glm.glMatrix.toRadian(camera.zoom), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100)
    shader.setMat4('projection', projection)

    let model = glm.mat4.create()
    //glm.mat4.rotate(model, model, glm.glMatrix.toRadian(Date.now()*0.03), glm.vec3.fromValues(0.1, 0.3, 0.5))
    shader.setMat4('model', model)

    let normalMatrix = glm.mat3.create()
    glm.mat3.fromMat4(normalMatrix, model)
    glm.mat3.invert(normalMatrix, normalMatrix)
    glm.mat3.transpose(normalMatrix, normalMatrix)
    shader.setMat3('normalMatrix', normalMatrix)

    gl.drawArrays(gl.TRIANGLES, 0, 36)

    lampShader.use()
    lampShader.setMat4('projection', projection)
    lampShader.setMat4('view', view)
    model = glm.mat4.create()
    glm.mat4.translate(model, model, lightPos)
    glm.mat4.scale(model, model, glm.vec3.fromValues(0.2, 0.2, 0.2))
    lampShader.setMat4('model', model)
    gl.drawArrays(gl.TRIANGLES, 0, 36)
  }

  function animate(timeStamp) {
    let currentFrame = timeStamp
    deltaTime = currentFrame - lastFrame
    lastFrame = currentFrame

    processInput()

    drawScene(timeStamp)
    requestAnimationFrame(animate)
  }

  function processInput() {

    if (currentlyPressedKeys['w']) {
      camera.processKeyboard(Camera.Movement.FORWARD, deltaTime)
    }
    if (currentlyPressedKeys['s']) {
      camera.processKeyboard(Camera.Movement.BACKWARD, deltaTime)
    }
    if (currentlyPressedKeys['a']) {
      camera.processKeyboard(Camera.Movement.LEFT, deltaTime)
    }
    if (currentlyPressedKeys['d']) {
      camera.processKeyboard(Camera.Movement.RIGHT, deltaTime)
    }
    if (currentlyPressedKeys[' ']) {
      camera.processKeyboard(Camera.Movement.UP, deltaTime)
    }
    if (currentlyPressedKeys['Control']) {
      camera.processKeyboard(Camera.Movement.DOWN, deltaTime)
    }

  }

  function mouse_callback(e) {
    let xoffset = e.movementX
    let yoffset = -e.movementY
    camera.processMouseMovement(xoffset, yoffset)
  }

  function wheel_callback(e) {
    //console.log(e.wheelDeltaY)
    camera.processMouseScroll(e.wheelDeltaY)
  }

}


init()
