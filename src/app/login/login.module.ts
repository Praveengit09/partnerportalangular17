import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WidgetModule } from "../layout/widget/widget.module";
import { LoginComponent } from "./login.component";

export const routes: Routes = [
  { path: "", component: LoginComponent, pathMatch: "full" },
];

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    WidgetModule,
    MatInputModule,
  ],
})
export class LoginModule {
  static routes = routes;
}
