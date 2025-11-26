from django.shortcuts import render
from .models import Product, Customer, Order


def product_list(request):
    products = Product.objects.all()
    exact_products = Product.objects.filter(name__exact='Laptop')
    startswith_products=Product.objects.filter(name__startswith='iPhone')
    endswith_products=Product.objects.filter(name__startswith='iPhone')
    price_gt=Product.objects.filter(price__gt=500)
    price_gte=Product.objects.filter(price__gte=500)
    price_lt=Product.objects.filter(price__lt=500)
    price_lte=Product.objects.filter(price__lte=600)
    price_range=Product.objects.filter(price__range=(300,800))
    contains_lastname = Customer.objects.filter(last_name__contains='Smith')
    product_id_in = Product.objects.filter(id__in=[1, 2, 3])
    email_isnull=Customer.objects.filter(email__isnull=True)

    return render(request, 'product_list.html', {'products': products,
                                                 'exact_products': exact_products,
                                                 'startswith_products': startswith_products,
                                                 'endswith_products': endswith_products,
                                                 'price_gt': price_gt,
                                                 'price_gte': price_gte,
                                                 'price_lt': price_lt,
                                                 'price_lte': price_lte,
                                                 'price_range': price_range,
                                                 'contains_lastname': contains_lastname,
                                                 'product_id_in': product_id_in,
                                                 'email_isnull': email_isnull
                                                 })

    