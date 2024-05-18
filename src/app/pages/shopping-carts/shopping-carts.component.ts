import { EditshoppingcartComponent } from './../../modal/editshoppingcart/editshoppingcart.component';
import { Shoppingcart } from './../../models/shoppingcart.model';
import { InvoiceComponent } from '../../modal/invoice/invoice.component';
import { Category } from './../../models/category.model';
import { Product } from './../../models/product.model';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProductService } from 'src/app/_services/product.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ProductformComponent } from 'src/app/modal/productform/productform.component';
import { MatPaginator } from '@angular/material/paginator';
import { CategoryformComponent } from 'src/app/modal/categoryform/categoryform.component';
import { MessageboxComponent } from 'src/app/modal/messagebox/messagebox.component';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-shopping-carts',
  templateUrl: './shopping-carts.component.html',
  styleUrls: ['./shopping-carts.component.css']
})
export class ShoppingCartsComponent implements OnInit {
  columnsToDisplay = ["id", 'username', "createddate", "shippingdate", "completeddate", 'status', "action"];
  dataSource: MatTableDataSource<any> = null;
  shoppingcarts: Shoppingcart[] = [];
  constructor(public productservice: ProductService, private token: TokenStorageService
    , public dialog: MatDialog) { }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this.refreshshoppingcarts();
  }
  getstatus(shoppingcart: any): string {
    if (shoppingcart.completeddate == null && shoppingcart.shippingdate == null)
      return "Processing Order"
    if (shoppingcart.completeddate != null && shoppingcart.shippingdate != null)
      return "Completed"
    if (shoppingcart.shippingdate != null && shoppingcart.completeddate == null)
      return "Shipping"
  }
  shipcart(shoppingcart: any) {
    this.productservice.setShippingDate(shoppingcart).subscribe(
      data => {
        shoppingcart.shippingdate = data.shoppingcart.shippingdate
        this.messagebox("Order Shipped")
      },
      err => {
        this.messagebox("couldn't ship order")
      })
  }
  completecart(shoppingcart: any) {
    this.productservice.setCompletedDate(shoppingcart).subscribe(
      data => {
        shoppingcart.completeddate = data.shoppingcart.completeddate
        this.messagebox("Order Completed")
      },
      err => {
        this.messagebox("couldn't complete order")
      })
  }
  refreshshoppingcarts() {
    this.productservice.getAllShoppingCarts().subscribe(
      data => {
        this.shoppingcarts = data.list;
        this.dataSource = new MatTableDataSource(this.shoppingcarts);
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
      },
      err => {
        this.messagebox(err);
      }
    );
  }
  public doFilter = (value: string, type: String) => {
    switch (type) {
      case 'shoppingcart':
        this.dataSource.filter = value.trim().toLocaleLowerCase();
    }
  }
  messagebox(body: string, title?: string) {
    if (title === undefined)
      title = "Notice"
    const dialogRef = this.dialog.open(MessageboxComponent, {
      width: '350px',
      data: {
        title: title, body: body
      }
    });
  }
  viewshoppingcart(shoppingcart: any) {
    const dialogRef = this.dialog.open(InvoiceComponent, {
      panelClass: ['full-screen-modal'],
      minWidth: "90%",
      data: {
        shoppingcart
      }
    });
  }
  editshoppingcart(shoppingcart) {
    //this.getShoppingCart(shoppingcart)
    this.openShoppingCartEditor(shoppingcart)
  }
  getShoppingCart(shoppingcart) {
    this.productservice.getShoppingCart(shoppingcart.user).subscribe(
      data => {
        shoppingcart = data.shoppingcart
      },
      err => {
        console.log(err)
      }
    )
  }
  openShoppingCartEditor(shoppingcart) {
    const dialogRef = this.dialog.open(EditshoppingcartComponent, {
      panelClass: ['full-screen-modal'],
      minWidth: "90%",
      data: {
        shoppingcart
      }
    });
    dialogRef.afterClosed().subscribe(() => this.refreshshoppingcarts()
    )
  }
  returnorderssincelastweek(orderstatus: string): number {
    let today = new Date()
    var lastweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7);
    if (orderstatus == "createddate")
      return this.shoppingcarts.filter((item: any) =>
        new Date(item.createddate).getTime() >= lastweek.getTime() &&
        new Date(item.createddate).getTime() <= today.getTime()
      ).length
    if (orderstatus == "shippingdate")
      return this.shoppingcarts.filter((item: any) =>
        new Date(item.shippingdate).getTime() >= lastweek.getTime() &&
        new Date(item.shippingdate).getTime() <= today.getTime()
      ).length
    if (orderstatus == "completeddate")
      return this.shoppingcarts.filter((item: any) =>
        new Date(item.completeddate).getTime() >= lastweek.getTime() &&
        new Date(item.completeddate).getTime() <= today.getTime()
      ).length
    if (orderstatus == "pending")
      return this.shoppingcarts.filter((item: any) =>
        item.shippingdate == null || item.shippingdate == ""
      ).length
  }
  returnorders(orderstatus: string): number {
    let today = new Date()
    if (orderstatus == "createddate")
      return this.shoppingcarts.length
    if (orderstatus == "shippingdate")
      return this.shoppingcarts.filter((item: any) =>
        (item.completeddate == null || item.completeddate == "")
        && (item.shippingdate != null || item.shippingdate != "")
      ).length
    if (orderstatus == "completeddate")
      return this.shoppingcarts.filter((item: any) =>
        item.completeddate != null || item.completeddate != ""
      ).length
    if (orderstatus == "pending")
      return this.shoppingcarts.filter((item: any) =>
        item.shippingdate == null || item.shippingdate == ""
      ).length
  }
}
