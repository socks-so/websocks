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

type GetDeployStatus = {
  status: number;
  body: string;
};

let tries = 0;

export async function deploy(token: string, path: string) {
  const apiUrl = "https://anax8w78ed.execute-api.eu-central-1.amazonaws.com";
  const requestUrl = apiUrl + "/getUrl";
  const statusUrl = apiUrl + "/uploadStatus";

  console.log("Building websocks...");
  const file = buildFile(path);
  console.log("Building finished!");

  console.log("Requesting upload URL...");
  const data = await fetchUrl(requestUrl, token);
  if (data.status !== 200) {
    const error = data as GetUrlError;
    console.error(
      "Failed with message: " + error.body.error + " (" + error.status + ")"
    );
    return;
  }
  console.log("Got URL to upload file!");
  const success = data as GetUrlSuccess;
  const functionName = success.body.uploadData.fields.key;

  console.log("Uploading websocks server files...");
  const res = await uploadFile(success.body.uploadData, file);
  if (!res.ok) {
    console.error("Failed to upload file with message: " + res.statusText);
    return;
  } else {
    console.log("Successfully uploaded files!");
    console.log("Deploying websocks server...");
    tries = 0;
    await monitorDeployment(statusUrl, functionName!);
  }
}

async function monitorDeployment(statusUrl: string, functionName: string) {
  tries++;
  if (tries > 20) {
    console.error(
      "Your server may be deployed, but the CLI failed to check the status. Check your dashboard!"
    );
    return;
  }
  setTimeout(async () => {
    const status = await checkStatus(statusUrl, functionName);
    if (status.status == 200) {
      console.log(
        "Successfully deployed websocks server with the function name: " +
          functionName
      );
    } else if (status.status == 202) {
      await monitorDeployment(statusUrl, functionName);
    } else {
      console.error(
        "Failed to deploy websocks server with the error: " + status.body
      );
    }
  }, 1000);
}

async function checkStatus(url: string, functionName: string) {
  const deployStatus = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      functionName: functionName,
    }),
  });
  if (!deployStatus.ok) {
    console.error(
      "Failed to check status with message: " +
        deployStatus.body +
        ". Our status API may be down. Please check your dashboard!"
    );
  }
  const data = (await deployStatus.json()) as GetDeployStatus;
  return data;
}

function buildFile(path: string) {
  const file = fs.readFileSync(path + "test.mjs");
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

async function fetchUrl(
  url: string,
  token: string
): Promise<GetUrlError | GetUrlSuccess> {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        token: token,
      }),
    });
    if (!response.ok) {
      throw new Error("Internal server error");
    }
    const responseData = (await response.json()) as any;
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
