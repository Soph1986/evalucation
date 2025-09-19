const Controller = ((model, view) => {
    const { dom } = view;
    const { Courses } = model;
    const init = () => {
      const courses = new Courses();
  
      // Handle click on Available Courses (toggle)
      dom.avail_container.addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (!li) return;
  
        const courseName = li.dataset.name;
        courses.toggleTemp(courseName);
        li.classList.toggle("selected");  
      });
  
     
      dom.add_btn.addEventListener("click", () => {
        courses.confirmSelections();
      });
      
    };
  
    return { init };
  })(Model, View)
  