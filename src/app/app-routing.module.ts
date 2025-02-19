import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./routes/home/home.component";
import { ModelComponent } from "./routes/model/model.component";
import { NotFoundComponent } from "./routes/not-found/not-found.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "model/:id", component: ModelComponent },
  { path: "**", component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
