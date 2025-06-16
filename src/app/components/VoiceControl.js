"use client";

import { useEffect, useRef, useState } from "react";

const VoiceControl = ({ onCommand }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [commandResult, setCommandResult] = useState("");

  useEffect(() => {
    // ตรวจสอบการรองรับ Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();

      // ตั้งค่า recognition
      recognition.continuous = false; // ไม่ฟังต่อเนื่อง
      recognition.interimResults = true; // แสดงผลระหว่างฟัง
      recognition.lang = "th-TH"; // ภาษาไทยเป็นหลัก

      // จัดการเมื่อได้ผลลัพธ์
      recognition.onresult = event => {
        console.log("🎤 ได้รับผลลัพธ์ (onresult):", event);

        let currentTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          console.log(`🎤 ผลลัพธ์ ${i}:`, result[0].transcript, `(confidence: ${result[0].confidence})`);

          if (result.isFinal) {
            console.log("🎤 ✅ ผลลัพธ์สุดท้าย:", result[0].transcript);
            currentTranscript += result[0].transcript;
          } else {
            console.log("🎤 ⏳ ผลลัพธ์ชั่วคราว:", result[0].transcript);
            currentTranscript += result[0].transcript;
          }
        }

        if (currentTranscript.trim()) {
          console.log("🎤 transcript รวม:", currentTranscript);
          setTranscript(currentTranscript);

          // ใส่ timeout เพื่อให้ user เห็นคำที่ได้ยิน
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            console.log("🎤 ⏰ Timeout - ประมวลผลคำสั่ง");
            processVoiceCommand(currentTranscript);
            setIsListening(false);
          }, 500); // หยุดพูด 0.5 วิ
        }
      };

      // จัดการเมื่อเริ่มฟัง
      recognition.onstart = () => {
        console.log("🎤 ✅ เริ่มฟังเสียงแล้ว (onstart)");
        setIsListening(true);
        setTranscript("");
        setCommandResult(""); // ล้างผลลัพธ์เก่า
        setLastCommand(""); // ล้างคำสั่งเก่า
      };

      // จัดการผลลัพธ์การรับรู้เสียง
      recognition.onresult = event => {
        console.log("🎤 ได้ผลลัพธ์:", event);

        let finalTranscript = "";
        let interimTranscript = "";

        // รวบรวม transcript
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        console.log("🎤 transcript รวม:", fullTranscript);
        setTranscript(fullTranscript);

        // ถ้าได้คำพูดสุดท้าย ให้ประมวลผลคำสั่ง
        if (finalTranscript.trim()) {
          console.log("🎤 ประมวลผลคำสั่งเสียง:", finalTranscript);
          processVoiceCommand(finalTranscript.trim());
        }
      };

      // จัดการเมื่อหยุดฟัง
      recognition.onend = () => {
        console.log("🎤 หยุดฟัง");
        setIsListening(false);
        setIsRecording(false);

        // ล้าง timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      // จัดการข้อผิดพลาด
      recognition.onerror = event => {
        console.log("🎤 ข้อผิดพลาด:", event.error);

        if (event.error === "not-allowed") {
          console.log("🎤 ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน");
        } else if (event.error === "no-speech") {
          console.log("🎤 ไม่มีเสียงพูด - หยุดฟัง");
        } else {
          console.log("🎤 เกิดข้อผิดพลาด - หยุดฟัง");
        }

        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.log("🎤 เบราว์เซอร์ไม่รองรับ Speech Recognition");
      setIsSupported(false);
    }

    // Cleanup
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  // เพิ่ม useEffect เพื่อล้างผลลัพธ์คำสั่งหลังจาก 3 วินาที
  useEffect(
    () => {
      if (commandResult) {
        const timer = setTimeout(() => {
          setCommandResult("");
          setLastCommand("");
        }, 3000); // ล้างหลังจาก 3 วินาที

        return () => clearTimeout(timer);
      }
    },
    [commandResult]
  );

  // ฟังก์ชันเริ่มฟัง
  const startListening = async () => {
    console.log("🎤 startListening() ถูกเรียก");

    if (!recognitionRef.current) {
      console.log("🎤 ❌ recognitionRef.current ไม่มี");
      return;
    }

    if (isListening) {
      console.log("🎤 ❌ กำลังฟังอยู่แล้ว");
      return;
    }

    try {
      console.log("🎤 ตรวจสอบสิทธิ์ไมโครโฟน...");

      // ตรวจสอบสิทธิ์ไมโครโฟน
      const permission = await navigator.permissions.query({ name: "microphone" });
      console.log("🎤 สิทธิ์ไมโครโฟน:", permission.state);

      if (permission.state === "denied") {
        console.log("🎤 ❌ ไมโครโฟนถูกปฏิเสธ");
        return;
      }

      console.log("🎤 ทดสอบการเข้าถึงไมโครโฟน...");

      // ทดสอบการเข้าถึงไมโครโฟน
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // หยุดทันที

      console.log("🎤 ✅ เริ่มฟัง...");
      recognitionRef.current.start();
    } catch (error) {
      console.log("🎤 ❌ ไม่สามารถเข้าถึงไมโครโฟนได้:", error.message);
      if (error.name === "NotAllowedError") {
        console.log("🎤 ❌ กรุณาอนุญาตการใช้ไมโครโฟนในเบราว์เซอร์");
      }
    }
  };

  // ฟังก์ชันหยุดฟัง
  const stopListening = () => {
    console.log("🎤 stopListening() ถูกเรียก");

    if (!isListening) {
      console.log("🎤 ไม่ได้ฟังอยู่");
      return;
    }

    console.log("🎤 ✅ หยุดฟัง");
    recognitionRef.current?.stop();
  };

  // ประมวลผลคำสั่งเสียง
  const processVoiceCommand = command => {
    const cmd = command.toLowerCase().trim();
    console.log("🔄 ประมวลผลคำสั่ง:", cmd);
    console.log("🔄 คำสั่งเดิม (ก่อน toLowerCase):", command);
    console.log("🔄 ทดสอบ: cmd.includes('รีเซ็ตมาร์คเกอร์'):", cmd.includes("รีเซ็ตมาร์คเกอร์"));
    console.log("🔄 ทดสอบ: cmd.includes('รีเซ็ต marker'):", cmd.includes("รีเซ็ต marker"));

    // เก็บคำสั่งล่าสุด
    setLastCommand(command);

    // คำสั่งรีเซ็ตทุกอย่าง (ไทย + อังกฤษ) - ตรวจสอบก่อน
    if (
      cmd.includes("reset all") ||
      cmd.includes("reset everything") ||
      cmd.includes("clear all") ||
      cmd.includes("รีเซ็ตทั้งหมด") ||
      cmd.includes("รีเซ็ททั้งหมด") ||
      cmd.includes("ลบทั้งหมด") ||
      cmd.includes("ล้างทั้งหมด") ||
      cmd.includes("เคลียร์ทั้งหมด")
    ) {
      console.log("🔄 Voice Command: Reset Everything");
      console.log("🔄 ส่งคำสั่ง RESET_EVERYTHING ไปยัง handleVoiceCommand");
      console.log("🔄 onCommand function type:", typeof onCommand);
      console.log("🔄 เรียก onCommand('RESET_EVERYTHING')...");
      setCommandResult("✅ รีเซ็ตทุกอย่างแล้ว");
      onCommand("RESET_EVERYTHING");
      console.log("🔄 ✅ เรียก onCommand เสร็จแล้ว");
      return;
    }

    // คำสั่งรีเซ็ต markers (ไทย + อังกฤษ) - ตรวจสอบก่อนคำสั่งทั่วไป
    if (
      cmd.includes("reset marker") ||
      cmd.includes("reset markers") ||
      cmd.includes("reset maker") ||
      cmd.includes("reset parker") ||
      cmd.includes("clear marker") ||
      cmd.includes("clear markers") ||
      cmd.includes("delete marker") ||
      cmd.includes("delete markers") ||
      cmd.includes("remove marker") ||
      cmd.includes("remove markers") ||
      cmd.includes("รีเซ็ตมาร์กเกอร์") ||
      cmd.includes("รีเซ็ทมาร์กเกอร์") ||
      cmd.includes("รีเซ็ตมาร์คเกอร์") ||
      cmd.includes("รีเซ็ทมาร์คเกอร์") ||
      cmd.includes("รีเซ็ต marker") ||
      cmd.includes("รีเซ็ท marker") ||
      cmd.includes("ลบมาร์กเกอร์") ||
      cmd.includes("ลบมาร์กเกอร์ทั้งหมด") ||
      cmd.includes("ล้างมาร์กเกอร์") ||
      cmd.includes("เคลียร์มาร์กเกอร์") ||
      cmd.includes("ลบจุด") ||
      cmd.includes("ลบจุดทั้งหมด") ||
      cmd.includes("ลบจุดหมด") ||
      cmd.includes("รีเซ็ตจุด") ||
      cmd.includes("รีเซ็ทจุด")
    ) {
      console.log("🔄 Voice Command: Reset All Markers");
      console.log("🔄 ส่งคำสั่ง RESET_ALL_MARKERS ไปยัง handleVoiceCommand");
      setCommandResult("✅ รีเซ็ตมาร์กเกอร์แล้ว");
      onCommand("RESET_ALL_MARKERS");
      return;
    }

    // คำสั่งรีเซ็ต zones/groups (ไทย + อังกฤษ) - ตรวจสอบก่อนคำสั่งทั่วไป
    if (
      cmd.includes("reset zone") ||
      cmd.includes("reset zones") ||
      cmd.includes("reset group") ||
      cmd.includes("reset groups") ||
      cmd.includes("clear zone") ||
      cmd.includes("clear zones") ||
      cmd.includes("clear group") ||
      cmd.includes("clear groups") ||
      cmd.includes("delete zone") ||
      cmd.includes("delete zones") ||
      cmd.includes("delete group") ||
      cmd.includes("delete groups") ||
      cmd.includes("remove zone") ||
      cmd.includes("remove zones") ||
      cmd.includes("remove group") ||
      cmd.includes("remove groups") ||
      cmd.includes("รีเซ็ตโซน") ||
      cmd.includes("รีเซ็ทโซน") ||
      cmd.includes("ลบโซน") ||
      cmd.includes("ลบโซนทั้งหมด") ||
      cmd.includes("ล้างโซน") ||
      cmd.includes("เคลียร์โซน") ||
      cmd.includes("รีเซ็ตกลุ่ม") ||
      cmd.includes("รีเซ็ทกลุ่ม") ||
      cmd.includes("ลบกลุ่ม") ||
      cmd.includes("ลบกลุ่มทั้งหมด") ||
      cmd.includes("ลบพื้นที่") ||
      cmd.includes("ลบพื้นที่ทั้งหมด") ||
      cmd.includes("ลบพื้นที่หมด") ||
      cmd.includes("ลบกรุ๊ป") ||
      cmd.includes("ลบกรุ๊ปทั้งหมด") ||
      cmd.includes("รีเซ็ตกรุ๊ป") ||
      cmd.includes("รีเซ็ทกรุ๊ป")
    ) {
      console.log("🔄 Voice Command: Reset All Zones/Groups");
      console.log("🔄 ส่งคำสั่ง RESET_ALL_ZONES ไปยัง handleVoiceCommand");
      setCommandResult("✅ รีเซ็ตกลุ่ม/โซนแล้ว");
      onCommand("RESET_ALL_ZONES");
      return;
    }

    // คำสั่งลบ object ที่เลือก (ไทย + อังกฤษ) - ตรวจสอบหลังคำสั่งเฉพาะ
    if (
      cmd.includes("delete") ||
      cmd.includes("remove") ||
      cmd.includes("ลบ") ||
      cmd.includes("เอาออก") ||
      cmd.includes("ลบออก")
    ) {
      console.log("🗑️ Voice Command: Delete Selected");
      console.log("🔄 ส่งคำสั่ง DELETE ไปยัง handleVoiceCommand");
      setCommandResult("✅ ลบแล้ว");
      onCommand("DELETE");
      return;
    }

    // คำสั่ง Undo (ไทย + อังกฤษ)
    if (
      cmd.includes("undo") ||
      cmd.includes("back") ||
      cmd.includes("ย้อนกลับ") ||
      cmd.includes("ยกเลิก") ||
      cmd.includes("กลับ") ||
      cmd.includes("อันดู")
    ) {
      console.log("↶ Voice Command: Undo");
      console.log("🔄 ส่งคำสั่ง UNDO ไปยัง handleVoiceCommand");
      setCommandResult("✅ ย้อนกลับแล้ว");
      onCommand("UNDO");
      return;
    }

    // คำสั่ง Redo (ไทย + อังกฤษ)
    if (
      cmd.includes("redo") ||
      cmd.includes("next") ||
      cmd.includes("forward") ||
      cmd.includes("ทำซ้ำ") ||
      cmd.includes("ทำใหม่") ||
      cmd.includes("รีดู") ||
      cmd.includes("ไปข้างหน้า")
    ) {
      console.log("↷ Voice Command: Redo");
      console.log("🔄 ส่งคำสั่ง REDO ไปยัง handleVoiceCommand");
      setCommandResult("✅ ทำซ้ำแล้ว");
      onCommand("REDO");
      return;
    }

    // คำสั่งรีเซ็ต (zoom/pan) (ไทย + อังกฤษ) - ตรวจสอบหลังสุด
    if (
      cmd.includes("reset") ||
      cmd.includes("home") ||
      cmd.includes("center") ||
      cmd.includes("รีเซ็ต") ||
      cmd.includes("กลับหน้าแรก") ||
      cmd.includes("กึ่งกลาง") ||
      cmd.includes("ตรงกลาง") ||
      cmd.includes("กลับปกติ")
    ) {
      console.log("🏠 Voice Command: Reset View");
      console.log("🔄 ส่งคำสั่ง RESET ไปยัง handleVoiceCommand");
      setCommandResult("✅ รีเซ็ตมุมมองแล้ว");
      onCommand("RESET");
      return;
    }

    // ถ้าไม่ตรงคำสั่งใดๆ
    console.log("❓ Unknown command:", command);
    console.log("🔄 ส่งคำสั่ง UNKNOWN ไปยัง handleVoiceCommand");
    setCommandResult("❓ ไม่เข้าใจคำสั่ง");
    onCommand("UNKNOWN", command);
  };

  if (!isSupported) {
    return <div className="text-xs text-gray-500">เบราว์เซอร์นี้ไม่รองรับการควบคุมด้วยเสียง</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onMouseDown={e => {
          console.log("🎤 ปุ่มถูกกด (onMouseDown)");
          e.preventDefault();
          startListening();
        }}
        onMouseUp={e => {
          console.log("🎤 ปุ่มถูกปล่อย (onMouseUp)");
          e.preventDefault();
          stopListening();
        }}
        onMouseLeave={e => {
          console.log("🎤 เมาส์ออกจากปุ่ม (onMouseLeave)");
          e.preventDefault();
          stopListening();
        }}
        disabled={!isSupported}
        className={`w-10 h-10 rounded-full text-white text-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg ${
          isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
        }`}
        title={isListening ? "กำลังฟัง... (ปล่อยเพื่อหยุด)" : "กดค้างเพื่อพูดคำสั่ง"}
      >
        🎤
      </button>

      <div className="text-xs text-center">
        <div className={isListening ? "text-red-600 font-medium animate-pulse" : "text-gray-600"}>
          {isListening ? "กำลังฟัง..." : "กดค้างเพื่อพูด"}
        </div>
        {transcript && <div className="text-blue-600 font-medium mt-1">ได้ยิน: {transcript}</div>}
        {commandResult && (
          <div
            className={`font-medium mt-2 px-2 py-1 rounded text-xs ${
              commandResult.includes("✅")
                ? "bg-green-100 text-green-700"
                : commandResult.includes("❓")
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {commandResult}
          </div>
        )}
        {lastCommand && commandResult && <div className="text-gray-500 text-xs mt-1">คำสั่ง: "{lastCommand}"</div>}
      </div>
    </div>
  );
};

export default VoiceControl;
