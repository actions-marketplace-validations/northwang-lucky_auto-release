export async function getResponseData<T>(
  request: () => Promise<{ status: 200 | 201; data: T }>
) {
  try {
    const response = await request();
    if (![200, 201].includes(response.status)) {
      throw new Error(`Request content failed! Status: ${response.status}`);
    }
    return response.data;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    console.error(err);
    throw new Error("Something is wrong when request by octokit!");
  }
}
