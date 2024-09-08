import axios from 'axios';

const meals = {
  Breakfast: [
    { type: "Western", name: "Eggs Benedict", price: 12, image: "https://www.allrecipes.com/thmb/QVMaPhXnj1HQ70C7Ka9WYtuipHg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/17205-eggs-benedict-DDMFS-4x3-a0042d5ae1da485fac3f468654187db0.jpg" },
    { type: "Asian", name: "Congee with Century Egg", price: 8, image:"http://surl.li/zdzgak" },
    { type: "Western", name: "Pancakes with Maple Syrup", price: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_Tqe0wCpF_6JE4AXdLLIL04iT45743iTQJA&s" },
    { type: "Asian", name: "Nasi Lemak", price: 9, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMXmWHSCjp66gqveWoJSRFfdPTJnCKvdigbw&s" }
  ],
  Lunch: [
    { type: "Western", name: "Grilled Chicken Caesar Salad", price: 14,image:"https://static01.nyt.com/images/2015/06/17/dining/17PAIR2/17PAIR2-superJumbo.jpg" },
    { type: "Asian", name: "Beef Pho", price: 13,image:"https://www.simplyrecipes.com/thmb/6NSfqz9vDog4Ct97ZKaEeG5ByFs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__simply_recipes__uploads__2019__04__Beef-Pho-LEAD-2-afc6b6a9144947fb9d72070d7ea8c95c.jpg" },
    { type: "Western", name: "Club Sandwich with Fries", price: 12,image:"https://c8.alamy.com/comp/BY7G39/fresh-triple-decker-club-sandwich-with-french-fries-on-side-BY7G39.jpg" },
    { type: "Asian", name: "Sushi Bento Box", price: 16,image:"https://www.frugalnutrition.com/wp-content/uploads/2015/08/IMG_0158.jpg" }
  ],
  Dinner: [
    { type: "Western", name: "Grilled Salmon with Asparagus", price: 22,image:"https://cdn.sweetzivile.com/wp-content/uploads/2021/06/07101037/Grilled-blackened-salmon-resized-large.jpeg" },
    { type: "Asian", name: "Thai Green Curry with Rice", price: 18,image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR43UmZyuu-J5r_FLNC2B7stNJHNs5UwzT4PA&s"},
    { type: "Western", name: "Steak Frites", price: 25,image:"https://gladkokken.imgix.net/Entrecote-cafe-de-paris-5.jpg?auto=compress%2Cformat&crop=focalpoint&fit=crop&fm=jpg&fp-x=0.5&fp-y=0.5&h=630&q=60&w=1200&s=02005406e8b6d88065ecf5301a2bcb90" },
    { type: "Asian", name: "Peking Duck", price: 28,image:"https://thewoksoflife.com/wp-content/uploads/2015/11/peking-duck-recipe-12.jpg" }
  ]
};



export default meals;
