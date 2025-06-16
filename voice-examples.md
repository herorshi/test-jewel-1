# ตัวอย่างการใช้งาน Voice Control Libraries

## 1. Web Speech API (ที่ใช้ในโปรเจกต์)

```javascript
// ไม่ต้องติดตั้งอะไรเพิ่ม - ใช้ built-in browser API
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "th-TH";
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  console.log("Voice:", command);
};
recognition.start();
```

## 2. React Speech Kit

```bash
npm install react-speech-kit
```

```javascript
import { useSpeechRecognition } from "react-speech-kit";

function MyComponent() {
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      if (result.includes("สร้างโซน")) {
        console.log("🎯 สร้าง Zone");
      }
    }
  });

  return (
    <button onMouseDown={listen} onMouseUp={stop}>
      {listening ? "กำลังฟัง..." : "กดเพื่อพูด"}
    </button>
  );
}
```

## 3. Annyang.js

```bash
npm install annyang
```

```javascript
import annyang from "annyang";

const commands = {
  สร้างโซน: () => console.log("🎯 สร้าง Zone"),
  "ลบ *item": (item) => console.log(`🗑️ ลบ ${item}`),
  ย้อนกลับ: () => console.log("↶ Undo")
};

if (annyang) {
  annyang.addCommands(commands);
  annyang.setLanguage("th-TH");
  annyang.start();
}
```

## 4. Alan AI (Advanced)

```bash
npm install @alan-ai/alan-sdk-web
```

```javascript
import alanBtn from "@alan-ai/alan-sdk-web";

useEffect(() => {
  alanBtn({
    key: "YOUR_ALAN_KEY",
    onCommand: (commandData) => {
      if (commandData.command === "create_zone") {
        console.log("🎯 AI: สร้าง Zone");
      }
    }
  });
}, []);
```

## 5. SpeechRecognition with Custom Hooks

```javascript
// hooks/useSpeechRecognition.js
import { useState, useEffect, useRef } from "react";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported");
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.interimResults = true;
    recognition.lang = "th-TH";
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(transcript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!recognitionRef.current
  };
};
```

## คำสั่งเสียงที่รองรับในโปรเจกต์ (ภาษาอังกฤษเท่านั้น)

### 🎯 **การจัดการ Zone**:

- **"create zone"** / **"new zone"** / **"add zone"** - สร้าง Zone ใหม่

### 🗑️ **การลบ**:

- **"delete"** / **"remove"** - ลบ object ที่เลือก
- **"reset marker"** / **"clear marker"** / **"delete marker"** / **"remove marker"** - ลบ marker ทั้งหมด
- **"reset zone"** / **"clear zone"** / **"delete zone"** / **"remove zone"** / **"delete group"** / **"remove group"** / **"clear group"** - ลบ zone ทั้งหมด
- **"reset all"** / **"clear all"** / **"delete all"** / **"remove all"** - ลบทุกอย่างบนภาพ

### ↶↷ **Undo/Redo**:

- **"undo"** / **"back"** - ย้อนกลับ
- **"redo"** / **"next"** / **"forward"** - ทำซ้ำ

### 🔍 **การซูม**:

- **"zoom in"** / **"zoom closer"** / **"magnify"** - ซูมเข้า
- **"zoom out"** / **"zoom back"** / **"shrink"** - ซูมออก

### 🏠 **การรีเซ็ต**:

- **"reset"** / **"home"** / **"center"** - รีเซ็ต zoom และ pan กลับสู่ตำแหน่งเริ่มต้น

### ✕ **การยกเลิก**:

- **"cancel"** / **"clear selection"** / **"deselect"** - ยกเลิกการเลือก

## การใช้งาน

1. คลิกปุ่มไมโครโฟน 🎤
2. พูดคำสั่งที่ต้องการ
3. ระบบจะประมวลผลและทำงานตามคำสั่ง
4. ดูผลลัพธ์ใน Console

## ข้อกำหนด

- ต้องใช้ HTTPS (localhost ใช้ได้)
- รองรับเฉพาะ Chrome, Edge, Safari
- ต้องอนุญาตการใช้งานไมโครโฟน
- ควรมีสัญญาณอินเทอร์เน็ตที่ดี

## Tips สำหรับความแม่นยำ

1. **พูดชัดเจน** - ออกเสียงให้ชัด
2. **พูดช้าๆ** - ไม่ต้องรีบ
3. **ใช้คำสั่งสั้นๆ** - หลีกเลี่ยงประโยคยาว
4. **ทดสอบในสภาพแวดล้อมเงียบ** - หลีกเลี่ยงเสียงรบกวน
5. **ใช้คำสำคัญ** - เน้นคำสำคัญในประโยค
