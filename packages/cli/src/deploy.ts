import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import fs from "fs";

type GetUrlSuccess = {
  status: number;
  body: {
    uploadData: PresignedPost;
  };
};
type GetUrlError = {
  status: number;
  body: { error: string };
};

export async function deploy(token: string, path: string) {
  const url =
    "https://hk10pi3as3.execute-api.eu-central-1.amazonaws.com/getUrl/" + token;
  const file = buildFile(path);
  console.log(file);

  const data = await fetchUrl(url);
  if (data.status !== 200) {
    const error = data as GetUrlError;
    console.error(
      "Failed with message: " + error.body.error + " (" + error.status + ")"
    );
    return;
  }
  const success = data as GetUrlSuccess;

  const res = await uploadFile(success.body.uploadData, file);
  if (!res.ok) {
    console.error("Failed to upload file with message: " + res.statusText);
    return;
  } else {
    console.log("Successfully uploaded your file, deploying...");
  }
}

function buildFile(path: string) {
  const file = fs.readFileSync(path + "test.txt");
  const blob = new Blob([file], { type: "text/plain" });
  return blob;
}

function uploadFile(presignedData: PresignedPost, file: Blob) {
  const formData = new FormData();
  Object.keys(presignedData.fields).forEach((key) => {
    formData.append(key, presignedData.fields[key]);
  });
  formData.append("file", file);
  return fetch(presignedData.url, {
    method: "POST",
    body: formData,
  });
}

async function fetchUrl(url: string): Promise<GetUrlError | GetUrlSuccess> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Internal server error");
    }
    const responseData = await response.json();
    if (responseData.status == 200) {
      return {
        status: responseData.status,
        body: JSON.parse(responseData.body),
      };
    } else {
      return {
        status: responseData.status,
        body: JSON.parse(responseData.body),
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: 500,
        body: {
          error: error.message,
        },
      };
    }
    return {
      status: 500,
      body: {
        error: "Unknown error",
      },
    };
  }
}
