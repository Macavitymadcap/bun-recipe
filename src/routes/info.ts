import { Context } from "hono";
import { BaseRoute } from "./base-route";
import { Container } from "./container";
import { DefaultContent } from "../components/DefaultContent";

export class InfoRoute extends BaseRoute {
  constructor(container: Container = Container.getInstance()) {
    super({ prefix: "/info" });
  }

  protected initializeRoutes() {
    this.app.get("/default", this.getDeafultContent.bind(this));
  }

  private async getDeafultContent(context: Context) {
    return context.html(DefaultContent());
  }
}
