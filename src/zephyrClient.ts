import axios from "axios";

export class ZephyrClient {
  constructor(private token: string) {}

  async createTestCase(projectKey: string, name: string) {

    const payload = {
      projectKey,
      name,
      testScript: {
        type: "PLAIN_TEXT",
        text: name
      }
    };

    const res = await axios.post(
      "https://api.zephyrscale.smartbear.com/v2/testcases",
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data;
  }
}
