"use client";
import { useState } from "react";
import useSWR from "swr";


export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  const { data: account, isLoading } = useSWR(
    "/api/account",
    (url) => fetch(url).then(res => res.json().then(d => d?.account))
  );

  const { data: workflowStatus, isLoading: workflowStatusIsLoading } = useSWR(
    workflowId ? `/api/upload/status?workflowId=${workflowId}` : null,
    (url) => fetch(url).then(res => res.json().then(d => d?.status))
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async() => {
    if (!file) return;

    setLoading(true);

    const presignedUrlRes = await fetch(`/api/presigned-s3-url?fileName=${file.name}&contentType=${file.type}`);
    const { url: presignedUrl } = await presignedUrlRes.json();

    if(!presignedUrl) {
      console.error("Failed to get presigned S3 url for account upload...");
      return;
    }

    const upload = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!upload.ok) throw new Error("Upload failed");

    const triggerRes = await fetch("/api/start-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({customerName: account, fileName: file.name}),
    });
    if(!triggerRes.ok) throw new Error("Failed to start workflow...");

    const data = await triggerRes.json();
    const { workflowId = "", error = "" } = data as {workflowId?: string, error?: any};
    setUploadError(error);
    setWorkflowId(workflowId);

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-4 border border-gray-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Upload a PDF</h2>
      <div className="flex flex-col max-w-sm mx-auto">
        <input
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 mt-2 mb-4 text-sm font-semibold text-gray-900"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading || !account}
          className="mx-auto px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {(!account && !isLoading) &&
          <p className="text-sm text-gray-500">Go to Login first...</p>
        }
        {uploadError &&
          <span className="text-red-500">{uploadError}</span>
        }
        {workflowId && JSON.stringify(workflowId)}
        {workflowStatus && JSON.stringify(workflowStatus)}
      </div>
    </div>
  );
}
