from django.shortcuts import render

from django.http import HttpResponse

def HOME(request):
   
    return render(request,'home.html')

def FILMS(request):
    
    favourite_films = ['Vikings','Mr.Robot','Fast And Furious Tokyo Drift','A Bronx Tale']
    
    rates = [8.4, 7.1, 6.6, 9.9]
    
    films_data = zip(favourite_films, rates)
    
    return render(request, 'films.html', {'films_data': films_data})
