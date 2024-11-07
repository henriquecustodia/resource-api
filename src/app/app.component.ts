import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, computed, inject, resource, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { RouterOutlet } from "@angular/router";
import { delay } from "rxjs";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [FormsModule, CommonModule],
  template: `
    <label class="form-control w-full max-w-xs">
      <div class="label">
        <span class="label-text">Ordenar por</span>
      </div>
      <div class="join">
        <input
          class="join-item btn"
          type="radio"
          name="options"
          aria-label="Menor preço"
          value="<"
          [(ngModel)]="priceSorting"
        />
        <input
          class="join-item btn"
          type="radio"
          name="options"
          aria-label="Maior preço"
          value=">"
          [(ngModel)]="priceSorting"
        />
      </div>
    </label>

    <label class="input input-bordered flex items-center gap-2 w-96 mt-4">
      R$
      <input
        type="number"
        class="grow"
        placeholder="Preço máximo"
        [(ngModel)]="priceLimit"
      />
    </label>

    <button class="btn btn-primary mt-4" (click)="items.reload()">
      Recarregar Resource
    </button>

    <br />

    <div class="join  mt-4">
      <input
        class="input input-bordered join-item"
        placeholder="Título do item"
        #title
      />
      <input
        class="input input-bordered join-item"
        placeholder="Preço"
        #price
      />
      <button
        class="btn join-item rounded-r-full"
        (click)="addItem(title.value, price.value)"
      >
        Adicionar
      </button>
    </div>

    <div class="mt-4">
      <div>Resource Status</div>
      <div> Status: {{ items.status() }} </div>
    </div>

    <div class="overflow-x-auto mt-4">
      <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
          </tr>
        </thead>
        <tbody>
          @if (!items.isLoading()) {
            @for (item of items.value(); track item.id) {
              <tr class="hover">
                <td>{{ item.title }}</td>
                <td>{{ item.price | currency: "BRL" }}</td>
              </tr>
            }
          } @else {
            <tr>
              <td colspan="2">Carregando...</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  httpClient = inject(HttpClient);

  priceLimit = signal(null);
  priceSorting = signal("<");

  // items = this.resourceWithPromise();
  items = this.resourceWithObservable();

  addItem(title: string, price: string) {
    this.items.update((items) => {
      return [
        ...items,
        {
          id: items.length + 1,
          title: title,
          price: Number(price),
        },
      ];
    });
  }

  private resourceWithPromise() {
    return resource({
      request: () => {
        return {
          priceLimit: this.priceLimit(),
          priceSorting: this.priceSorting(),
        };
      },
      loader: ({ request: { priceLimit, priceSorting } }) => {
        const params = new URLSearchParams();

        if (priceLimit !== null) {
          params.append("price_lte", priceLimit);
        }

        if (priceSorting === "<") {
          params.append("_sort", "price");
        } else {
          params.append("_sort", "-price");
        }

        return fetch(`http://localhost:3000/items?${params.toString()}`).then(
          (res) => res.json()
        );
      },
    });
  }

  private resourceWithObservable() {
    return rxResource({
      request: () => {
        return {
          priceLimit: this.priceLimit(),
          priceSorting: this.priceSorting(),
        };
      },
      loader: ({ request: { priceLimit, priceSorting } }) => {
        const params = new URLSearchParams();

        if (priceLimit !== null) {
          params.append("price_lte", priceLimit);
        }

        if (priceSorting === "<") {
          params.append("_sort", "price");
        } else {
          params.append("_sort", "-price");
        }

        return this.httpClient
          .get<any>(`http://localhost:3000/items?${params.toString()}`)
          .pipe(delay(2000));
      },
    });
  }
}
