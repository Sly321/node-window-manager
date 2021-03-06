#include <node.h>
#include <windows.h>
#include <string>
#include <iostream>
#include <fstream>

void throwError(v8::Isolate *isolate, const char *error)
{
  isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, error)));
}

/**
 * Gets currently focused window.
 * @returns {int} windowHandle
 */
void getActiveWindow(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  HWND handle = GetForegroundWindow();

  v8::Local<v8::Number> num = v8::Number::New(isolate, (int)handle);

  args.GetReturnValue().Set(num);
}

/**
 * Moves window to x, y and sets its width and height.
 * @param {int} windowHandle
 * @param {int} x
 * @param {int} y
 * @param {int} width
 * @param {int} height
 */
void moveWindow(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  if (
      !args[0]->IsNumber() ||
      !args[1]->IsNumber() ||
      !args[2]->IsNumber() ||
      !args[3]->IsNumber() ||
      !args[4]->IsNumber())
  {
    throwError(isolate, "Wrong arguments");
    return;
  }

  const HWND handle = (HWND)args[0]->Int32Value();
  const size_t x = args[1]->Int32Value();
  const size_t y = args[2]->Int32Value();
  const size_t width = args[3]->Int32Value();
  const size_t height = args[4]->Int32Value();

  MoveWindow(handle, x, y, width, height, true);
}

/**
 * Gets window left, top, right, bottom properties.
 * @param {int} windowHandle
 * @returns {object} the window bounds
 */
void getWindowBounds(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsNumber())
  {
    throwError(isolate, "Wrong arguments");
    return;
  }

  RECT bounds;
  GetWindowRect((HWND)args[0]->Int32Value(), &bounds);

  v8::Local<v8::Object> obj = v8::Object::New(isolate);
  obj->Set(v8::String::NewFromUtf8(isolate, "left"), v8::Number::New(isolate, (int)bounds.left));
  obj->Set(v8::String::NewFromUtf8(isolate, "top"), v8::Number::New(isolate, (int)bounds.top));
  obj->Set(v8::String::NewFromUtf8(isolate, "right"), v8::Number::New(isolate, (int)bounds.right));
  obj->Set(v8::String::NewFromUtf8(isolate, "bottom"), v8::Number::New(isolate, (int)bounds.bottom));

  args.GetReturnValue().Set(obj);
}

/**
 * Gets window title.
 * @param {int} windowHandle
 * @returns {string}
 */
void getWindowTitle(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsNumber())
  {
    throwError(isolate, "Wrong arguments");
    return;
  }

  char title[256];
  HWND handle = (HWND)args[0]->Int32Value();
  GetWindowText(handle, title, sizeof(title));

  v8::Local<v8::String> result = v8::String::NewFromUtf8(isolate, title);
  args.GetReturnValue().Set(result);
}

/**
 * Sets window state (e.g minimized)
 * @param {int} flag
 */
void setWindowState(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsNumber() || !args[1]->IsNumber())
  {
    throwError(isolate, "Wrong arguments");
    return;
  }

  const HWND handle = (HWND)args[0]->Int32Value();
  const int flag = args[1]->Int32Value();

  ShowWindow(handle, flag);
}

/**
 * @param {int} windowHandle
 * @param {int} hWndInsertAfter
 * @param {int} x
 * @param {int} y
 * @param {int} cx - width
 * @param {int} cy - height
 * @param {int} uFlags
 */
void setWindowPos(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  if (
      !args[0]->IsNumber() ||
      !args[1]->IsNumber() ||
      !args[2]->IsNumber() ||
      !args[3]->IsNumber() ||
      !args[4]->IsNumber() ||
      !args[5]->IsNumber() ||
      !args[6]->IsNumber())
  {
    throwError(isolate, "Wrong arguments");
    return;
  }

  const HWND handle = (HWND)args[0]->Int32Value();
  const HWND hWndInsertAfter = (HWND)args[1]->Int32Value();
  const int x = args[2]->Int32Value();
  const int y = args[3]->Int32Value();
  const int cx = args[4]->Int32Value();
  const int cy = args[5]->Int32Value();
  const UINT uFlags = (UINT)args[6]->Int32Value();

  SetWindowPos(handle, hWndInsertAfter, x, y, cx, cy, uFlags);
}

/**
 * @param {int} windowHandle
 * @param {int} nIndex
 * @param {int} dwNewLong
 */
void setWindowLong(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  if (
      !args[0]->IsNumber() ||
      !args[1]->IsNumber() ||
      !args[2]->IsNumber())
  {
    throwError(isolate, "Wrong arguments");
    return;
  }

  const HWND handle = (HWND)args[0]->Int32Value();
  const int nIndex = args[1]->Int32Value();
  const LONG dwNewLong = (LONG)args[2]->Int32Value();

  SetWindowLong(handle, nIndex, dwNewLong);
}

/**
 * @param {int} windowHandle
 * @param {int} nIndex
 * @return {int}
 */
void getWindowLong(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();

  if (
      !args[0]->IsNumber() ||
      !args[1]->IsNumber())
  {
    throwError(isolate, "Wrong arguments");
    return;
  }

  const HWND handle = (HWND)args[0]->Int32Value();
  const int nIndex = args[1]->Int32Value();
  const long val = GetWindowLong(handle, nIndex);

  v8::Local<v8::Number> num = v8::Number::New(isolate, (int)val);

  args.GetReturnValue().Set(num);
}

v8::Local<v8::Function> _cb;
v8::Isolate *_isolate;
HHOOK _hook;

LRESULT CALLBACK HookCallback(int nCode, WPARAM wParam, LPARAM lParam)
{
  if (nCode >= 0)
  {
    if (wParam == WM_LBUTTONUP)
    {
      v8::Local<v8::Value> argv[1];
      _cb->Call(v8::Null(_isolate), 0, argv);
    }
  }

  return CallNextHookEx(_hook, nCode, wParam, lParam);
}

void createMouseUpHook(const v8::FunctionCallbackInfo<v8::Value> &args)
{
  v8::Isolate *isolate = args.GetIsolate();
  _isolate = isolate;

  _cb = v8::Local<v8::Function>::Cast(args[0]);

  _hook = SetWindowsHookEx(WH_MOUSE_LL, HookCallback, NULL, 0);

  MSG msg;
  while (GetMessage(&msg, NULL, 0, 0) > 0)
  {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }
}

void Initialize(v8::Local<v8::Object> exports)
{
  NODE_SET_METHOD(exports, "getActiveWindow", getActiveWindow);
  NODE_SET_METHOD(exports, "moveWindow", moveWindow);
  NODE_SET_METHOD(exports, "getWindowBounds", getWindowBounds);
  NODE_SET_METHOD(exports, "getWindowTitle", getWindowTitle);
  NODE_SET_METHOD(exports, "setWindowState", setWindowState);
  NODE_SET_METHOD(exports, "setWindowPos", setWindowPos);
  NODE_SET_METHOD(exports, "setWindowLong", setWindowLong);
  NODE_SET_METHOD(exports, "getWindowLong", getWindowLong);
  NODE_SET_METHOD(exports, "createMouseUpHook", createMouseUpHook);
}

NODE_MODULE(windows_window_manager, Initialize);