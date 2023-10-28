import { PresignedPost } from "@aws-sdk/s3-presigned-post";

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
    "https://qulem8hglj.execute-api.eu-central-1.amazonaws.com/getUrl/" + token;
  const data = await fetchUrl(url);
  if (data.status !== 200) {
    const error = data as GetUrlError;
    console.error(
      "Failed with message: " + error.body.error + " (" + error.status + ")"
    );
    return;
  }
  const success = data as GetUrlSuccess;
  const uploadData = success.body.uploadData;
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
